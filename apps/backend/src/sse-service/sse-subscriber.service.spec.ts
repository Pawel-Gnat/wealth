import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RedisService } from "../redis-service/redis.service.js";
import { sseUserChannel } from "./helpers/sse-channels.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";
import { SseSubscriber } from "./sse-subscriber.service.js";

describe("SseSubscriber", () => {
	let moduleRef: TestingModule;
	let subscriber: SseSubscriber;
	let getConnections: ReturnType<typeof vi.fn>;
	let unregister: ReturnType<typeof vi.fn>;
	let onMessage: ReturnType<typeof vi.fn>;
	let nextA: ReturnType<typeof vi.fn>;
	let completeA: ReturnType<typeof vi.fn>;
	let nextB: ReturnType<typeof vi.fn>;
	let completeB: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		nextA = vi.fn();
		completeA = vi.fn();
		nextB = vi.fn();
		completeB = vi.fn();
		getConnections = vi.fn().mockReturnValue([
			{
				connectionId: "conn-a",
				userId: "user-1",
				sessionId: "session-a",
				sink: { next: nextA, complete: completeA },
			},
			{
				connectionId: "conn-b",
				userId: "user-1",
				sessionId: "session-b",
				sink: { next: nextB, complete: completeB },
			},
		]);
		unregister = vi.fn().mockResolvedValue(undefined);
		onMessage = vi.fn().mockReturnValue(() => {});

		moduleRef = await Test.createTestingModule({
			providers: [
				SseSubscriber,
				{
					provide: RedisService,
					useValue: { onMessage },
				},
				{
					provide: SseConnectionRegistry,
					useValue: { getConnections, unregister },
				},
			],
		}).compile();
		subscriber = moduleRef.get(SseSubscriber);
	});

	afterEach(async () => {
		await moduleRef.close();
	});

	it("writes data frames to matching connections and closes on auth revoke", async () => {
		const event = {
			type: "auth.session-revoked",
			payload: {},
			scope: "session",
			targetId: "session-a",
			occurredAt: "2026-07-21T10:00:00.000Z",
			id: "evt-1",
		};

		await subscriber.handleMessage(
			sseUserChannel("user-1"),
			JSON.stringify(event),
		);

		expect(nextA).toHaveBeenCalledWith(event);
		expect(completeA).toHaveBeenCalledOnce();
		expect(unregister).toHaveBeenCalledWith("user-1", "conn-a");
		expect(nextB).not.toHaveBeenCalled();
		expect(completeB).not.toHaveBeenCalled();
	});

	it("fans out user-scoped revoke to all local connections", async () => {
		const event = {
			type: "auth.session-revoked",
			payload: {},
			scope: "user",
			targetId: "user-1",
			occurredAt: "2026-07-21T10:00:00.000Z",
			id: "evt-2",
		};

		await subscriber.handleMessage(
			sseUserChannel("user-1"),
			JSON.stringify(event),
		);

		expect(nextA).toHaveBeenCalledWith(event);
		expect(nextB).toHaveBeenCalledWith(event);
		expect(completeA).toHaveBeenCalledOnce();
		expect(completeB).toHaveBeenCalledOnce();
		expect(unregister).toHaveBeenCalledTimes(2);
	});

	it("ignores malformed and invalid envelopes", async () => {
		await subscriber.handleMessage(sseUserChannel("user-1"), "{not-json");
		await subscriber.handleMessage(
			sseUserChannel("user-1"),
			JSON.stringify({ type: "unknown.event" }),
		);

		expect(nextA).not.toHaveBeenCalled();
		expect(unregister).not.toHaveBeenCalled();
	});
});
