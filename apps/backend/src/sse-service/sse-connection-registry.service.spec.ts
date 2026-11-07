import { Test, type TestingModule } from "@nestjs/testing";
import { SSE_MAX_CONNECTIONS_PER_USER } from "@repo/common/constants";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SseConnectionRegistry } from "./sse-connection-registry.service";

describe("SseConnectionRegistry", () => {
	let moduleRef: TestingModule;
	let registry: SseConnectionRegistry;

	const sink = {
		next: vi.fn(),
		complete: vi.fn(),
	};

	beforeEach(async () => {
		moduleRef = await Test.createTestingModule({
			providers: [SseConnectionRegistry],
		}).compile();

		registry = moduleRef.get(SseConnectionRegistry);
	});

	afterEach(async () => {
		await moduleRef.close();
		vi.clearAllMocks();
	});

	it("keeps every connection for a user until the last one closes", () => {
		const first = registry.register({
			userId: "user-1",
			sessionId: "session-a",
			sink,
		});
		registry.register({
			userId: "user-1",
			sessionId: "session-b",
			sink,
		});

		expect(registry.getConnections("user-1")).toHaveLength(2);
		expect(registry.getConnections("user-1")).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					connectionId: first.connectionId,
					sessionId: "session-a",
				}),
				expect.objectContaining({ sessionId: "session-b" }),
			]),
		);

		registry.unregister("user-1", first.connectionId);
		expect(registry.getConnections("user-1")).toHaveLength(1);

		const remaining = registry.getConnections("user-1")[0];
		if (!remaining) {
			throw new Error("expected the second connection to remain");
		}
		registry.unregister("user-1", remaining.connectionId);
		expect(registry.getConnections("user-1")).toEqual([]);
	});

	it("drops the oldest connection when the per-user cap is reached", () => {
		const sinks = Array.from(
			{ length: SSE_MAX_CONNECTIONS_PER_USER + 1 },
			() => ({
				next: vi.fn(),
				complete: vi.fn(),
			}),
		);

		for (const [index, connectionSink] of sinks.entries()) {
			registry.register({
				userId: "user-1",
				sessionId: `session-${index}`,
				sink: connectionSink,
				connectionId: `conn-${index}`,
			});
		}

		expect(registry.getConnections("user-1")).toHaveLength(
			SSE_MAX_CONNECTIONS_PER_USER,
		);
		expect(sinks[0]?.complete).toHaveBeenCalledOnce();
		expect(registry.getConnections("user-1")).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({ connectionId: "conn-0" }),
			]),
		);
		expect(registry.getConnections("user-1")).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					connectionId: `conn-${SSE_MAX_CONNECTIONS_PER_USER}`,
				}),
			]),
		);
	});

	it("ignores unregister for unknown connections", () => {
		registry.unregister("missing-user", "missing-connection");
		expect(registry.getConnections("missing-user")).toEqual([]);
	});
});
