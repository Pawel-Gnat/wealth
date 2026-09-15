import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	applySessionSnapshot,
	clearAuthSession,
	configureAuthSession,
} from "./auth-session";

const snapshot = {
	user: { id: "user-1", email: "ada@example.com" },
	sessionExpiresAt: "2026-09-15T08:15:00.000Z",
};

describe("auth-session", () => {
	beforeEach(() => {
		configureAuthSession({});
		clearAuthSession();
	});

	describe("applySessionSnapshot", () => {
		it("notifies handler with the snapshot", () => {
			const onSessionApplied = vi.fn();
			configureAuthSession({ onSessionApplied });

			applySessionSnapshot(snapshot);

			expect(onSessionApplied).toHaveBeenCalledWith(snapshot);
		});
	});

	describe("clearAuthSession", () => {
		it("notifies handler when a session is active", () => {
			const onUnauthorized = vi.fn();
			configureAuthSession({ onUnauthorized });
			applySessionSnapshot(snapshot);

			clearAuthSession();

			expect(onUnauthorized).toHaveBeenCalledOnce();
		});

		it("does not notify again when session is already cleared", () => {
			const onUnauthorized = vi.fn();
			configureAuthSession({ onUnauthorized });
			applySessionSnapshot(snapshot);

			clearAuthSession();
			clearAuthSession();

			expect(onUnauthorized).toHaveBeenCalledOnce();
		});
	});
});
