import { Injectable } from "@nestjs/common";
import type { SessionEndedEvent, SseEvent } from "@repo/api/types";
import { ulid } from "ulid";
import { RedisService } from "../redis-service/redis.service.js";
import { sseUserChannel } from "./helpers/sse-channels.js";

@Injectable()
export class SsePublisher {
	constructor(private readonly redisService: RedisService) {}

	async publish(userId: string, event: SseEvent) {
		return this.redisService.publish(
			sseUserChannel(userId),
			JSON.stringify(event),
		);
	}

	async publishSessionEnded(input: { userId: string; targetId: string }) {
		const event: SessionEndedEvent = {
			type: "session-ended",
			targetId: input.targetId,
			occurredAt: new Date().toISOString(),
			id: ulid(),
		};

		return this.publish(input.userId, event);
	}
}
