import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearAuthSession,
	configureAuthSession,
	getAccessToken,
	persistAccessToken,
} from "./auth-session";

describe("auth-session", () => {
	beforeEach(() => {
		configureAuthSession({});
		clearAuthSession();
	});

	describe("persistAccessToken", () => {
		it("stores token in memory and notifies handler", () => {
			const onTokenRefreshed = vi.fn();
			configureAuthSession({ onTokenRefreshed });

			persistAccessToken("new-token");

			expect(getAccessToken()).toBe("new-token");
			expect(onTokenRefreshed).toHaveBeenCalledWith("new-token");
		});
	});

	describe("clearAuthSession", () => {
		it("clears token and notifies handler", () => {
			const onUnauthorized = vi.fn();
			persistAccessToken("token");
			configureAuthSession({ onUnauthorized });

			clearAuthSession();

			expect(getAccessToken()).toBeNull();
			expect(onUnauthorized).toHaveBeenCalledOnce();
		});
	});
});
