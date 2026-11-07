import { Injectable } from "@nestjs/common";
import type { SessionEndedEvent, SseEvent } from "@repo/api/types";
import { ulid } from "ulid";
import { SseConnectionRegistry } from "./sse-connection-registry.service";

@Injectable()
export class SsePublisher {
	constructor(private readonly connectionRegistry: SseConnectionRegistry) {}

	publish(userId: string, event: Exclude<SseEvent, SessionEndedEvent>) {
		for (const connection of this.connectionRegistry.getConnections(userId)) {
			connection.sink.next(event);
		}
	}

	publishSessionEnded(input: { userId: string; targetId: string }) {
		const event: SessionEndedEvent = {
			type: "session-ended",
			targetId: input.targetId,
			occurredAt: new Date().toISOString(),
			id: ulid(),
		};

		for (const connection of this.connectionRegistry.getConnections(
			input.userId,
		)) {
			if (connection.sessionId !== input.targetId) {
				continue;
			}

			connection.sink.next(event);
			connection.sink.complete();
			this.connectionRegistry.unregister(
				connection.userId,
				connection.connectionId,
			);
		}
	}
}
