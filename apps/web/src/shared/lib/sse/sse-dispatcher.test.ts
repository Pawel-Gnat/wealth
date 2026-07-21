import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearAuthSession,
	configureAuthSession,
	getAccessToken,
	persistAccessToken,
} from "@/shared/lib/auth/auth-session";
import { dispatchSseMessage } from "@/shared/lib/sse/sse-dispatcher";

const sessionRevokedPayload = JSON.stringify({
	type: "auth.session-revoked",
	payload: {},
	scope: "session",
	targetId: "session-1",
	occurredAt: "2026-07-21T12:00:00.000Z",
	id: "evt-1",
});

describe("dispatchSseMessage", () => {
	beforeEach(() => {
		configureAuthSession({});
		clearAuthSession();
	});

	it("clears the session on auth.session-revoked", () => {
		const onUnauthorized = vi.fn();
		persistAccessToken("token");
		configureAuthSession({ onUnauthorized });

		const event = dispatchSseMessage(sessionRevokedPayload);

		expect(event?.type).toBe("auth.session-revoked");
		expect(getAccessToken()).toBeNull();
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it("is safe when auth.session-revoked arrives after the session is already cleared", () => {
		const onUnauthorized = vi.fn();
		configureAuthSession({ onUnauthorized });

		dispatchSseMessage(sessionRevokedPayload);
		dispatchSseMessage(sessionRevokedPayload);

		expect(getAccessToken()).toBeNull();
		expect(onUnauthorized).toHaveBeenCalledTimes(2);
	});

	it("ignores malformed JSON", () => {
		persistAccessToken("token");

		expect(dispatchSseMessage("{not-json")).toBeNull();
		expect(getAccessToken()).toBe("token");
	});

	it("ignores envelopes that fail schema validation", () => {
		persistAccessToken("token");

		expect(
			dispatchSseMessage(
				JSON.stringify({
					type: "auth.session-revoked",
					payload: {},
					scope: "group",
					targetId: "session-1",
					occurredAt: "2026-07-21T12:00:00.000Z",
					id: "evt-1",
				}),
			),
		).toBeNull();
		expect(getAccessToken()).toBe("token");
	});
});
