import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { sseEventSchema } from "@repo/api/schemas";
import { OBSERVABILITY_EVENTS } from "@repo/observability/shared";
import { RedisService } from "../redis-service/redis.service";
import { logSseEvent } from "../shared/observability/log-event";
import { userIdFromSseChannel } from "./helpers/sse-channels";
import { SseConnectionRegistry } from "./sse-connection-registry.service";

@Injectable()
export class SseSubscriber implements OnModuleInit, OnModuleDestroy {
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
			logSseEvent(OBSERVABILITY_EVENTS.sseFrame);
			return;
		}

		const result = sseEventSchema.safeParse(parsed);
		if (!result.success) {
			logSseEvent(OBSERVABILITY_EVENTS.sseEnvelope);
			return;
		}

		const event = result.data;
		const matching = this.connectionRegistry
			.getConnections(userId)
			.filter((connection) => connection.sessionId === event.targetId);

		for (const connection of matching) {
			connection.sink.next(event);

			if (event.type === "session-ended") {
				connection.sink.complete();
				await this.connectionRegistry.unregister(
					connection.userId,
					connection.connectionId,
				);
			}
		}
	}
}
