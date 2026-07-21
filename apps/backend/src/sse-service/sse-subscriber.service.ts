import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { sseEventSchema } from "@repo/api/schemas";
import { RedisService } from "../redis-service/redis.service.js";
import { userIdFromSseChannel } from "./helpers/sse-channels.js";
import { filterConnectionsForEvent } from "./helpers/sse-event-filter.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";

@Injectable()
export class SseSubscriber implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SseSubscriber.name);
	private unsubscribeMessage: (() => void) | null = null;

	constructor(
		private readonly redisService: RedisService,
		private readonly connectionRegistry: SseConnectionRegistry,
	) {}

	onModuleInit() {
		this.unsubscribeMessage = this.redisService.onMessage(
			(channel, message) => {
				void this.handleMessage(channel, message);
			},
		);
	}

	onModuleDestroy() {
		this.unsubscribeMessage?.();
		this.unsubscribeMessage = null;
	}

	async handleMessage(channel: string, message: string) {
		const userId = userIdFromSseChannel(channel);
		if (!userId) {
			return;
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(message);
		} catch {
			this.logger.warn(`Ignored malformed SSE JSON on ${channel}`);
			return;
		}

		const result = sseEventSchema.safeParse(parsed);
		if (!result.success) {
			this.logger.warn(`Ignored invalid SSE envelope on ${channel}`);
			return;
		}

		const event = result.data;
		const matching = filterConnectionsForEvent(
			this.connectionRegistry.getConnections(userId),
			event,
		);

		for (const connection of matching) {
			connection.sink.next(event);

			if (event.type === "auth.session-revoked") {
				connection.sink.complete();
				await this.connectionRegistry.unregister(
					connection.userId,
					connection.connectionId,
				);
			}
		}
	}
}
