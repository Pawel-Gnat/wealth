import { REQUEST_ID_HEADER_NAME } from "@repo/common/constants";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	applySessionSnapshot,
	clearAuthSession,
	configureAuth,
	resetRefreshMutex,
} from "@/shared/lib/auth/auth-api";
import { orpcTransportFetch } from "@/shared/lib/orpc/orpc-transport";
import { server } from "@/test/servers";

const snapshot = {
	user: { id: "user-1", email: "ada@example.com" },
	sessionExpiresAt: "2026-09-15T08:15:00.000Z",
};

describe("orpcTransportFetch", () => {
	beforeEach(() => {
		configureAuth({});
		resetRefreshMutex();
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
		const refresh = vi.fn(() => HttpResponse.json({ data: snapshot }));

		server.use(
			http.post("*/auth/refresh", () => refresh()),
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
		let calls = 0;
		server.use(
			http.post("*/auth/refresh", () => {
				calls += 1;
				return HttpResponse.json(
					{ error: { message: "Unauthorized" } },
					{ status: 401 },
				);
			}),
		);

		const response = await orpcTransportFetch(
			"http://backend.test/auth/refresh",
			{ method: "POST" },
		);

		expect(calls).toBe(1);
		expect(response.status).toBe(401);
	});

	it("clears the session when refresh fails after a 401", async () => {
		const onCleared = vi.fn();
		configureAuth({ onCleared });
		applySessionSnapshot(snapshot);

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
		expect(onCleared).toHaveBeenCalledOnce();
	});
});
