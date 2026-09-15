import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import {
	bootstrapSession,
	getSessionRefreshDelayMs,
	refreshSession,
	resetRefreshMutex,
	SESSION_REFRESH_LEAD_MS,
} from "@/shared/lib/auth/auth-api";
import { clearAuthSession } from "@/shared/lib/auth/auth-session";
import { configureOrpcRefresh } from "@/shared/lib/orpc/orpc-transport";
import { server } from "@/test/servers";

const snapshot = {
	user: {
		id: "01JTZKQX2GT6PHGQER0M8FS6K8",
		email: "test@example.com",
	},
	sessionExpiresAt: "2026-09-15T08:15:00.000Z",
};

describe("getSessionRefreshDelayMs", () => {
	it("schedules refresh one minute before session expiry", () => {
		const now = Date.parse("2026-09-15T08:00:00.000Z");

		expect(getSessionRefreshDelayMs("2026-09-15T08:15:00.000Z", now)).toBe(
			SESSION_REFRESH_LEAD_MS * 14,
		);
		expect(getSessionRefreshDelayMs("2026-09-15T08:00:30.000Z", now)).toBe(0);
	});
});

describe("bootstrapSession", () => {
	beforeEach(() => {
		configureOrpcRefresh(null);
		resetRefreshMutex();
		clearAuthSession();
	});

	it("returns the GET /me snapshot", async () => {
		await expect(bootstrapSession()).resolves.toEqual({
			user: {
				id: "01JTZKQX2GT6PHGQER0M8FS6K8",
				email: "test@example.com",
			},
			sessionExpiresAt: expect.any(String),
		});
	});

	it("returns null when GET /me is unauthorized", async () => {
		server.use(
			http.get("*/auth/me", () =>
				HttpResponse.json(
					{ error: { message: "Unauthorized" } },
					{ status: 401 },
				),
			),
		);

		await expect(bootstrapSession()).resolves.toBeNull();
	});
});

describe("refreshSession", () => {
	beforeEach(() => {
		configureOrpcRefresh(null);
		resetRefreshMutex();
		clearAuthSession();
	});

	it("returns the snapshot from POST /refresh", async () => {
		server.use(
			http.post("*/auth/refresh", () => HttpResponse.json({ data: snapshot })),
		);

		await expect(refreshSession()).resolves.toEqual(snapshot);
	});

	it("returns null when POST /refresh is unauthorized", async () => {
		await expect(refreshSession()).resolves.toBeNull();
	});

	it("shares one in-flight refresh across parallel callers", async () => {
		let calls = 0;
		let release!: () => void;
		const held = new Promise<void>((resolve) => {
			release = resolve;
		});

		server.use(
			http.post("*/auth/refresh", async () => {
				calls += 1;
				await held;
				return HttpResponse.json({ data: snapshot });
			}),
		);

		const pending = Promise.all([
			refreshSession(),
			refreshSession(),
			refreshSession(),
		]);
		release();

		await expect(pending).resolves.toEqual([snapshot, snapshot, snapshot]);
		expect(calls).toBe(1);
	});
});
