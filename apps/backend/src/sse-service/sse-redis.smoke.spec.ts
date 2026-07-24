import { ConfigService } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RedisService } from "../redis-service/redis.service.js";
import {
	setupTestRedis,
	type TestRedisContext,
} from "../test/helpers/redis-setup.js";
import { sseUserChannel } from "./helpers/sse-channels.js";
import { SsePublisher } from "./sse-publisher.service.js";

describe("SSE Redis pub/sub smoke", () => {
	let redis: TestRedisContext;
	let moduleRef: TestingModule;
	let redisService: RedisService;
	let publisher: SsePublisher;

	beforeAll(async () => {
		redis = await setupTestRedis();
		moduleRef = await Test.createTestingModule({
			providers: [
				RedisService,
				SsePublisher,
				{
					provide: ConfigService,
					useValue: {
						get: (key: string) =>
							key === "REDIS_URL" ? redis.connectionUrl : undefined,
					},
				},
			],
		}).compile();

		redisService = moduleRef.get(RedisService);
		publisher = moduleRef.get(SsePublisher);
		await redisService.onModuleInit();
	}, 60_000);

	afterAll(async () => {
		await moduleRef?.close();
		await redis?.stop();
	});

	it("delivers a published auth.session-revoked envelope to a subscriber", async () => {
		expect(redisService.isAvailable()).toBe(true);

		const channel = sseUserChannel("smoke-user");
		const received = new Promise<string>((resolve) => {
			redisService.onMessage((messageChannel, message) => {
				if (messageChannel === channel) {
					resolve(message);
				}
			});
		});

		await expect(redisService.subscribe(channel)).resolves.toBe(true);

		await expect(
			publisher.publishAuthSessionRevoked({
				userId: "smoke-user",
				scope: "session",
				targetId: "smoke-session",
			}),
		).resolves.toBe(true);

		const payload = JSON.parse(await received);
		expect(payload).toMatchObject({
			type: "auth.session-revoked",
			payload: {},
			scope: "session",
			targetId: "smoke-session",
		});

		await expect(redisService.unsubscribe(channel)).resolves.toBe(true);
	});
});
