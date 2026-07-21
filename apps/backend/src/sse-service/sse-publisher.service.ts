import { Injectable } from "@nestjs/common";
import type { AuthSessionRevokedEvent, SseEvent } from "@repo/api/schemas";
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

	async publishAuthSessionRevoked(input: {
		userId: string;
		scope: AuthSessionRevokedEvent["scope"];
		targetId: string;
	}) {
		const event: AuthSessionRevokedEvent = {
			type: "auth.session-revoked",
			payload: {},
			scope: input.scope,
			targetId: input.targetId,
			occurredAt: new Date().toISOString(),
			id: ulid(),
		};

		return this.publish(input.userId, event);
	}
}
