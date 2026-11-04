import { Injectable } from "@nestjs/common";
import type { SseEvent } from "@repo/api/types";
import { SSE_MAX_CONNECTIONS_PER_USER } from "@repo/common/constants";
import { ulid } from "ulid";

export type SseConnectionSink = {
	next: (event: SseEvent) => void;
	complete: () => void;
};

export type SseConnection = {
	connectionId: string;
	userId: string;
	sessionId: string;
	sink: SseConnectionSink;
};

@Injectable()
export class SseConnectionRegistry {
	private readonly connectionsByUser = new Map<
		string,
		Map<string, SseConnection>
	>();

	register(input: {
		userId: string;
		sessionId: string;
		sink: SseConnectionSink;
		connectionId?: string;
	}): SseConnection {
		const connection: SseConnection = {
			connectionId: input.connectionId ?? ulid(),
			userId: input.userId,
			sessionId: input.sessionId,
			sink: input.sink,
		};

		let userConnections = this.connectionsByUser.get(input.userId);
		if (!userConnections) {
			userConnections = new Map();
			this.connectionsByUser.set(input.userId, userConnections);
		}

		while (userConnections.size >= SSE_MAX_CONNECTIONS_PER_USER) {
			const oldestId = userConnections.keys().next().value;
			if (!oldestId) {
				break;
			}

			const oldest = userConnections.get(oldestId);
			userConnections.delete(oldestId);
			oldest?.sink.complete();
		}

		userConnections.set(connection.connectionId, connection);
		return connection;
	}

	unregister(userId: string, connectionId: string) {
		const userConnections = this.connectionsByUser.get(userId);
		if (!userConnections?.delete(connectionId)) {
			return;
		}

		if (userConnections.size === 0) {
			this.connectionsByUser.delete(userId);
		}
	}

	getConnections(userId: string): readonly SseConnection[] {
		const userConnections = this.connectionsByUser.get(userId);
		if (!userConnections) {
			return [];
		}
		return [...userConnections.values()];
	}
}
