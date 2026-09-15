import { describe, expect, it, vi } from "vitest";
import type { SseConnection } from "../sse-connection-registry.service.js";
import { filterConnectionsForEvent } from "./sse-event-filter.js";

const connection = (
	partial: Pick<SseConnection, "userId" | "sessionId" | "connectionId">,
): SseConnection => ({
	...partial,
	sink: { next: vi.fn(), complete: vi.fn() },
});

describe("filterConnectionsForEvent", () => {
	const connections = [
		connection({
			connectionId: "c1",
			userId: "user-1",
			sessionId: "session-a",
		}),
		connection({
			connectionId: "c2",
			userId: "user-1",
			sessionId: "session-b",
		}),
	];

	it("filters by session id", () => {
		const matched = filterConnectionsForEvent(connections, {
			type: "session-ended",
			targetId: "session-b",
			occurredAt: "2026-07-21T10:00:00.000Z",
			id: "evt-1",
		});

		expect(matched).toHaveLength(1);
		expect(matched[0]?.connectionId).toBe("c2");
	});

	it("returns no connections when target does not match", () => {
		expect(
			filterConnectionsForEvent(connections, {
				type: "session-ended",
				targetId: "missing",
				occurredAt: "2026-07-21T10:00:00.000Z",
				id: "evt-3",
			}),
		).toEqual([]);
	});
});
