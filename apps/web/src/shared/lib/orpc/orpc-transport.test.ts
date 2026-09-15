import { REQUEST_ID_HEADER_NAME } from "@repo/common/constants";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	applySessionSnapshot,
	clearAuthSession,
	configureAuthSession,
} from "@/shared/lib/auth/auth-session";
import {
	configureOrpcRefresh,
	orpcTransportFetch,
} from "@/shared/lib/orpc/orpc-transport";
import { server } from "@/test/servers";

describe("orpcTransportFetch", () => {
	beforeEach(() => {
		configureOrpcRefresh(null);
		configureAuthSession({});
		clearAuthSession();
	});

	it("sends credentials and a request id", async () => {
		let credentials: RequestCredentials | undefined;
		let requestId: string | null = null;

		server.use(
			http.get("http://backend.test/ping-auth", ({ request }) => {
				credentials = request.credentials;
				requestId = request.headers.get(REQUEST_ID_HEADER_NAME);
				return HttpResponse.json({ ok: true });
			}),
		);

		const response = await orpcTransportFetch("http://backend.test/ping-auth");

		expect(response.ok).toBe(true);
		expect(credentials).toBe("include");
		expect(requestId).toEqual(expect.any(String));
	});

	it("retries a Request after a successful refresh", async () => {
		let calls = 0;
		const refresh = vi.fn().mockResolvedValue({
			user: { id: "user-1", email: "ada@example.com" },
			sessionExpiresAt: "2026-09-15T08:15:00.000Z",
		});
		configureOrpcRefresh(refresh);

		server.use(
			http.get("http://backend.test/expenses", () => {
				calls += 1;
				if (calls === 1) {
					return HttpResponse.json(
						{ error: { message: "Unauthorized" } },
						{ status: 401 },
					);
				}

				return HttpResponse.json({ data: [] });
			}),
		);

		const response = await orpcTransportFetch(
			new Request("http://backend.test/expenses"),
		);

		expect(refresh).toHaveBeenCalledOnce();
		expect(calls).toBe(2);
		expect(response.status).toBe(200);
	});

	it("does not refresh on a public auth route", async () => {
		const refresh = vi.fn();
		configureOrpcRefresh(refresh);

		const response = await orpcTransportFetch(
			"http://backend.test/auth/refresh",
			{ method: "POST" },
		);

		expect(refresh).not.toHaveBeenCalled();
		expect(response.status).toBe(401);
	});

	it("clears the session on 401 when refresh is not configured", async () => {
		const onUnauthorized = vi.fn();
		configureAuthSession({ onUnauthorized });
		applySessionSnapshot({
			user: { id: "user-1", email: "ada@example.com" },
			sessionExpiresAt: "2026-09-15T08:15:00.000Z",
		});

		server.use(
			http.get("http://backend.test/expenses", () =>
				HttpResponse.json(
					{ error: { message: "Unauthorized" } },
					{ status: 401 },
				),
			),
		);

		const response = await orpcTransportFetch("http://backend.test/expenses");

		expect(response.status).toBe(401);
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});
});
