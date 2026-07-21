import { Injectable, Logger } from "@nestjs/common";
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

@Injectable()
export class SseConnectionRegistry {
	private readonly logger = new Logger(SseConnectionRegistry.name);
	private readonly connectionsByUser = new Map<
		string,
		Map<string, SseConnection>
	>();
	private readonly subscribedUsers = new Set<string>();
	private readonly subscribeInFlight = new Map<string, Promise<void>>();

	constructor(private readonly redisService: RedisService) {}

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

		const isFirstForUser = userConnections.size === 0;
		userConnections.set(connection.connectionId, connection);

		if (isFirstForUser) {
			await this.ensureSubscribed(input.userId);
		}

		return connection;
	}

	async unregister(userId: string, connectionId: string) {
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
			this.logger.warn(
				`Skipped Redis subscribe for ${channel}; local registry still active`,
			);
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
