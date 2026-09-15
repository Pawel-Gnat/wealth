import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { AuthService } from "../auth-service/auth.service.js";
import { SessionGuard } from "./session.guard.js";

const createContext = (request: object) =>
	({
		switchToHttp: () => ({
			getRequest: () => request,
		}),
	}) as never;

describe("SessionGuard", () => {
	it("sets request.user from the session cookie", async () => {
		const request = {};
		const authService = {
			resolveRpcSession: vi.fn().mockResolvedValue({
				userId: "user-1",
				sessionId: "session-1",
				sessionExpiresAt: new Date("2026-09-15T08:15:00.000Z"),
			}),
		};
		const guard = new SessionGuard(authService as unknown as AuthService);

		await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
		expect(request).toMatchObject({
			user: {
				userId: "user-1",
				sessionId: "session-1",
				sessionExpiresAt: new Date("2026-09-15T08:15:00.000Z"),
			},
		});
	});

	it("rejects when there is no active session", async () => {
		const authService = {
			resolveRpcSession: vi.fn().mockResolvedValue(null),
		};
		const guard = new SessionGuard(authService as unknown as AuthService);

		await expect(guard.canActivate(createContext({}))).rejects.toBeInstanceOf(
			UnauthorizedException,
		);
	});
});
