import type { SseEvent } from "@repo/api/schemas";
import type { SseConnection } from "../sse-connection-registry.service.js";

export const filterConnectionsForEvent = (
	connections: readonly SseConnection[],
	event: SseEvent,
): SseConnection[] => {
	if (event.scope === "session") {
		return connections.filter(
			(connection) => connection.sessionId === event.targetId,
		);
	}

	if (event.scope === "user") {
		return connections.filter(
			(connection) => connection.userId === event.targetId,
		);
	}

	return [];
};
