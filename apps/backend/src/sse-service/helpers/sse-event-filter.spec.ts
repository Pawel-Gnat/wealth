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

	it("filters by sessionId for scope session", () => {
		const matched = filterConnectionsForEvent(connections, {
			type: "auth.session-revoked",
			payload: {},
			scope: "session",
			targetId: "session-b",
			occurredAt: "2026-07-21T10:00:00.000Z",
			id: "evt-1",
		});

		expect(matched).toHaveLength(1);
		expect(matched[0]?.connectionId).toBe("c2");
	});

	it("filters by userId for scope user", () => {
		const matched = filterConnectionsForEvent(connections, {
			type: "auth.session-revoked",
			payload: {},
			scope: "user",
			targetId: "user-1",
			occurredAt: "2026-07-21T10:00:00.000Z",
			id: "evt-2",
		});

		expect(matched).toHaveLength(2);
	});

	it("returns no connections when target does not match", () => {
		expect(
			filterConnectionsForEvent(connections, {
				type: "auth.session-revoked",
				payload: {},
				scope: "session",
				targetId: "missing",
				occurredAt: "2026-07-21T10:00:00.000Z",
				id: "evt-3",
			}),
		).toEqual([]);
	});
});
