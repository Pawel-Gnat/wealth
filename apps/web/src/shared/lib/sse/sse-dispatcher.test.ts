import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	applySessionSnapshot,
	clearAuthSession,
	configureAuthSession,
} from "@/shared/lib/auth/auth-session";
import { dispatchSseMessage } from "@/shared/lib/sse/sse-dispatcher";

const sessionEndedPayload = JSON.stringify({
	type: "session-ended",
	targetId: "session-1",
	occurredAt: "2026-07-21T12:00:00.000Z",
	id: "evt-1",
});

const snapshot = {
	user: { id: "user-1", email: "ada@example.com" },
	sessionExpiresAt: "2026-09-15T08:15:00.000Z",
};

describe("dispatchSseMessage", () => {
	beforeEach(() => {
		configureAuthSession({});
		clearAuthSession();
	});

	it("clears the session on session-ended", () => {
		const onUnauthorized = vi.fn();
		configureAuthSession({ onUnauthorized });
		applySessionSnapshot(snapshot);

		const event = dispatchSseMessage(sessionEndedPayload);

		expect(event?.type).toBe("session-ended");
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it("does not notify again when session-ended arrives after the session is already cleared", () => {
		const onUnauthorized = vi.fn();
		configureAuthSession({ onUnauthorized });
		applySessionSnapshot(snapshot);

		dispatchSseMessage(sessionEndedPayload);
		dispatchSseMessage(sessionEndedPayload);

		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it("ignores malformed JSON", () => {
		const onUnauthorized = vi.fn();
		configureAuthSession({ onUnauthorized });
		applySessionSnapshot(snapshot);

		expect(dispatchSseMessage("{not-json")).toBeNull();
		expect(onUnauthorized).not.toHaveBeenCalled();
	});

	it("ignores envelopes that fail schema validation", () => {
		const onUnauthorized = vi.fn();
		configureAuthSession({ onUnauthorized });
		applySessionSnapshot(snapshot);

		expect(
			dispatchSseMessage(
				JSON.stringify({
					type: "auth.session-revoked",
					targetId: "session-1",
					occurredAt: "2026-07-21T12:00:00.000Z",
					id: "evt-1",
				}),
			),
		).toBeNull();
		expect(onUnauthorized).not.toHaveBeenCalled();
	});
});
