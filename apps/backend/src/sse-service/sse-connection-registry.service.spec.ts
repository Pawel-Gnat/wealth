import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RedisService } from "../redis-service/redis.service.js";
import { sseUserChannel } from "./sse-channels.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";

describe("SseConnectionRegistry", () => {
	let moduleRef: TestingModule;
	let registry: SseConnectionRegistry;
	let subscribe: ReturnType<typeof vi.fn>;
	let unsubscribe: ReturnType<typeof vi.fn>;

	const sink = {
		next: vi.fn(),
		complete: vi.fn(),
	};

	beforeEach(async () => {
		subscribe = vi.fn().mockResolvedValue(true);
		unsubscribe = vi.fn().mockResolvedValue(true);

		moduleRef = await Test.createTestingModule({
			providers: [
				SseConnectionRegistry,
				{
					provide: RedisService,
					useValue: {
						subscribe,
						unsubscribe,
					},
				},
			],
		}).compile();

		registry = moduleRef.get(SseConnectionRegistry);
	});

	afterEach(async () => {
		await moduleRef.close();
		vi.clearAllMocks();
	});

	it("subscribes lazily on the first connection for a user", async () => {
		const first = await registry.register({
			userId: "user-1",
			sessionId: "session-a",
			sink,
		});
		expect(subscribe).toHaveBeenCalledExactlyOnceWith(sseUserChannel("user-1"));
		expect(registry.isSubscribed("user-1")).toBe(true);
		expect(registry.getConnectionCount("user-1")).toBe(1);

		await registry.register({
			userId: "user-1",
			sessionId: "session-b",
			sink,
		});
		expect(subscribe).toHaveBeenCalledOnce();
		expect(registry.getConnectionCount("user-1")).toBe(2);
		expect(registry.getConnections("user-1")).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					connectionId: first.connectionId,
					sessionId: "session-a",
				}),
				expect.objectContaining({ sessionId: "session-b" }),
			]),
		);
	});

	it("unsubscribes when the last connection for a user closes", async () => {
		const first = await registry.register({
			userId: "user-1",
			sessionId: "session-a",
			sink,
		});
		const second = await registry.register({
			userId: "user-1",
			sessionId: "session-b",
			sink,
		});

		await registry.unregister("user-1", first.connectionId);
		expect(unsubscribe).not.toHaveBeenCalled();
		expect(registry.isSubscribed("user-1")).toBe(true);

		await registry.unregister("user-1", second.connectionId);
		expect(unsubscribe).toHaveBeenCalledExactlyOnceWith(
			sseUserChannel("user-1"),
		);
		expect(registry.isSubscribed("user-1")).toBe(false);
		expect(registry.getConnections("user-1")).toEqual([]);
	});

	it("keeps the local registry when Redis subscribe fails", async () => {
		subscribe.mockResolvedValueOnce(false);

		const connection = await registry.register({
			userId: "user-1",
			sessionId: "session-a",
			sink,
		});

		expect(registry.getConnections("user-1")).toEqual([connection]);
		expect(registry.isSubscribed("user-1")).toBe(false);
	});

	it("ignores unregister for unknown connections", async () => {
		await registry.unregister("missing-user", "missing-connection");
		expect(unsubscribe).not.toHaveBeenCalled();
	});

	it("subscribes once when concurrent first registrations race", async () => {
		let resolveSubscribe: ((value: boolean) => void) | undefined;
		subscribe.mockImplementationOnce(
			() =>
				new Promise<boolean>((resolve) => {
					resolveSubscribe = resolve;
				}),
		);

		const firstPromise = registry.register({
			userId: "user-1",
			sessionId: "session-a",
			sink,
		});
		const secondPromise = registry.register({
			userId: "user-1",
			sessionId: "session-b",
			sink,
		});

		expect(subscribe).toHaveBeenCalledOnce();
		resolveSubscribe?.(true);

		await Promise.all([firstPromise, secondPromise]);
		expect(subscribe).toHaveBeenCalledOnce();
		expect(registry.getConnectionCount("user-1")).toBe(2);
		expect(registry.isSubscribed("user-1")).toBe(true);
	});
});
