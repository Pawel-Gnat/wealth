import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RedisService } from "../redis-service/redis.service.js";
import { sseUserChannel } from "./helpers/sse-channels.js";
import { SsePublisher } from "./sse-publisher.service.js";

describe("SsePublisher", () => {
	let moduleRef: TestingModule;
	let publisher: SsePublisher;
	let publish: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		publish = vi.fn().mockResolvedValue(true);
		moduleRef = await Test.createTestingModule({
			providers: [
				SsePublisher,
				{
					provide: RedisService,
					useValue: { publish },
				},
			],
		}).compile();
		publisher = moduleRef.get(SsePublisher);
	});

	afterEach(async () => {
		await moduleRef.close();
	});

	it("publishes auth.session-revoked envelopes on the user channel", async () => {
		await expect(
			publisher.publishAuthSessionRevoked({
				userId: "user-1",
				scope: "session",
				targetId: "session-a",
			}),
		).resolves.toBe(true);

		expect(publish).toHaveBeenCalledOnce();
		expect(publish.mock.calls[0]?.[0]).toBe(sseUserChannel("user-1"));

		const envelope = JSON.parse(publish.mock.calls[0]?.[1] as string);
		expect(envelope).toMatchObject({
			type: "auth.session-revoked",
			payload: {},
			scope: "session",
			targetId: "session-a",
		});
		expect(envelope.id).toBeTypeOf("string");
		expect(envelope.occurredAt).toBeTypeOf("string");
	});

	it("returns false when Redis publish is unavailable", async () => {
		publish.mockResolvedValueOnce(false);

		await expect(
			publisher.publishAuthSessionRevoked({
				userId: "user-1",
				scope: "user",
				targetId: "user-1",
			}),
		).resolves.toBe(false);
	});
});
