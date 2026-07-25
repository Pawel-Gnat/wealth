import { Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { SSE_MAX_CONNECTIONS_PER_USER } from "@repo/common/constants";
import { ulid } from "ulid";
import { RedisService } from "../redis-service/redis.service.js";
import { sseUserChannel } from "./helpers/sse-channels.js";

export type SseConnectionSink = {
	next: (data: unknown) => void;
	complete: () => void;
};

export type SseConnection = {
	connectionId: string;
	userId: string;
	sessionId: string;
	sink: SseConnectionSink;
};

export class SseFanOutUnavailableError extends Error {
	constructor() {
		super("SSE Redis subscribe unavailable");
		this.name = "SseFanOutUnavailableError";
	}
}

@Injectable()
export class SseConnectionRegistry implements OnModuleDestroy {
	private readonly logger = new Logger(SseConnectionRegistry.name);
	private readonly connectionsByUser = new Map<
		string,
		Map<string, SseConnection>
	>();
	private readonly subscribedUsers = new Set<string>();
	private readonly subscribeInFlight = new Map<string, Promise<void>>();
	private readonly unsubscribeReady: (() => void) | null;

	constructor(private readonly redisService: RedisService) {
		this.unsubscribeReady = this.redisService.onReady(() => {
			void this.resubscribeAllActive();
		});
	}

	onModuleDestroy() {
		this.unsubscribeReady?.();
	}

	async register(input: {
		userId: string;
		sessionId: string;
		sink: SseConnectionSink;
		connectionId?: string;
	}): Promise<SseConnection> {
		const connection: SseConnection = {
			connectionId: input.connectionId ?? ulid(),
			userId: input.userId,
			sessionId: input.sessionId,
			sink: input.sink,
		};

		let userConnections = this.connectionsByUser.get(input.userId);
		if (!userConnections) {
			userConnections = new Map();
			this.connectionsByUser.set(input.userId, userConnections);
		}

		while (userConnections.size >= SSE_MAX_CONNECTIONS_PER_USER) {
			const oldestId = userConnections.keys().next().value;
			if (!oldestId) {
				break;
			}

			const oldest = userConnections.get(oldestId);
			userConnections.delete(oldestId);
			oldest?.sink.complete();
		}

		const isFirstForUser = userConnections.size === 0;
		userConnections.set(connection.connectionId, connection);

		try {
			if (isFirstForUser || !this.subscribedUsers.has(input.userId)) {
				await this.ensureSubscribed(input.userId);
			}

			if (!this.subscribedUsers.has(input.userId)) {
				throw new SseFanOutUnavailableError();
			}
		} catch (error) {
			await this.removeConnection(input.userId, connection.connectionId);
			throw error;
		}

		return connection;
	}

	async unregister(userId: string, connectionId: string) {
		await this.removeConnection(userId, connectionId);
	}

	getConnections(userId: string): readonly SseConnection[] {
		const userConnections = this.connectionsByUser.get(userId);
		if (!userConnections) {
			return [];
		}
		return [...userConnections.values()];
	}

	getConnectionCount(userId: string) {
		return this.connectionsByUser.get(userId)?.size ?? 0;
	}

	isSubscribed(userId: string) {
		return this.subscribedUsers.has(userId);
	}

	private async removeConnection(userId: string, connectionId: string) {
		const userConnections = this.connectionsByUser.get(userId);
		if (!userConnections?.delete(connectionId)) {
			return;
		}

		if (userConnections.size > 0) {
			return;
		}

		this.connectionsByUser.delete(userId);
		await this.ensureUnsubscribed(userId);
	}

	private async resubscribeAllActive() {
		const userIds = [...this.connectionsByUser.keys()];
		for (const userId of userIds) {
			this.subscribedUsers.delete(userId);
			await this.ensureSubscribed(userId);

			if (this.subscribedUsers.has(userId)) {
				continue;
			}

			this.logger.warn(
				`Closing SSE connections for ${userId}; Redis subscribe unavailable after reconnect`,
			);
			await this.closeAllForUser(userId);
		}
	}

	private async closeAllForUser(userId: string) {
		const connections = this.getConnections(userId);
		for (const connection of connections) {
			connection.sink.complete();
			await this.removeConnection(userId, connection.connectionId);
		}
	}

	private async ensureSubscribed(userId: string) {
		if (this.subscribedUsers.has(userId)) {
			return;
		}

		const inFlight = this.subscribeInFlight.get(userId);
		if (inFlight) {
			await inFlight;
			return;
		}

		const subscribePromise = this.subscribeUser(userId).finally(() => {
			this.subscribeInFlight.delete(userId);
		});
		this.subscribeInFlight.set(userId, subscribePromise);
		await subscribePromise;
	}

	private async subscribeUser(userId: string) {
		if (this.subscribedUsers.has(userId)) {
			return;
		}

		const channel = sseUserChannel(userId);
		const subscribed = await this.redisService.subscribe(channel);
		if (!subscribed) {
			this.logger.warn(`Failed Redis subscribe for ${channel}`);
			return;
		}

		this.subscribedUsers.add(userId);
	}

	private async ensureUnsubscribed(userId: string) {
		const inFlight = this.subscribeInFlight.get(userId);
		if (inFlight) {
			await inFlight;
		}

		if (this.connectionsByUser.has(userId)) {
			return;
		}

		if (!this.subscribedUsers.has(userId)) {
			return;
		}

		const channel = sseUserChannel(userId);
		const unsubscribed = await this.redisService.unsubscribe(channel);
		this.subscribedUsers.delete(userId);

		if (!unsubscribed) {
			this.logger.warn(`Failed to Redis unsubscribe from ${channel}`);
		}
	}
}
