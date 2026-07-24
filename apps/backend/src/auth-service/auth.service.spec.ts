import { createHash } from "node:crypto";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { REFRESH_TOKEN_COOKIE_NAME } from "@repo/common/constants";
import * as bcrypt from "bcrypt";
import { subDays } from "date-fns";
import { and, eq, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

import { DBS } from "../database-service/constants.js";
import { refreshTokensTable } from "../database-service/tables/index.js";
import { SsePublisher } from "../sse-service/sse-publisher.service.js";
import { createAuthTestingModule } from "../test/helpers/modules.js";
import { createTestUser, uniqueTestUserEmail } from "../test/mocks/users.js";
import { UsersService } from "../users-service/users.service.js";
import { AuthService, RefreshTokenReuseError } from "./auth.service.js";

const hashToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

describe("Auth service", () => {
	let moduleRef: Awaited<ReturnType<typeof createAuthTestingModule>>;
	let authService: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;
	let db: NodePgDatabase;
	let publishAuthSessionRevoked: ReturnType<typeof vi.fn>;

	beforeAll(async () => {
		moduleRef = await createAuthTestingModule();
		authService = moduleRef.get(AuthService);
		usersService = moduleRef.get(UsersService);
		jwtService = moduleRef.get(JwtService);
		db = moduleRef.get(DBS.APP);
		publishAuthSessionRevoked = vi.mocked(
			moduleRef.get(SsePublisher).publishAuthSessionRevoked,
		);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	describe("validate user", () => {
		it("throws when user is not found", async () => {
			await expect(
				authService.validateUser({
					email: "missing-user-alias@example.com",
					password: "secret",
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it("throws when password does not match", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("correct-pass", 10),
				emailTag: "auth-wrong-password",
			});

			await expect(
				authService.validateUser({
					email: user.email,
					password: "wrong",
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it("returns user when credentials are valid", async () => {
			const plain = "secret-ok";
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash(plain, 10),
				emailTag: "auth-valid-credentials",
			});

			await expect(
				authService.validateUser({ email: user.email, password: plain }),
			).resolves.toEqual({
				id: expect.any(String),
				email: user.email,
			});
		});
	});

	describe("create session", () => {
		it("returns a signed access token and refresh token", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-create-session",
			});

			const result = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			const payload = await jwtService.verifyAsync<{
				sub: string;
				email: string;
			}>(result.accessToken);

			expect(payload).toMatchObject({
				sub: user.id,
				email: user.email,
			});
			expect(result.refreshToken).toBeTypeOf("string");
			expect(result.refreshToken.length).toBeGreaterThan(0);
			expect(result.refreshExpiresAt).toBeInstanceOf(Date);
			expect(result.sessionId).toBeTypeOf("string");
			expect(result.sessionId.length).toBeGreaterThan(0);

			const [row] = await db
				.select()
				.from(refreshTokensTable)
				.where(eq(refreshTokensTable.tokenHash, hashToken(result.refreshToken)))
				.limit(1);

			expect(row?.sessionId).toBe(result.sessionId);
		});

		it("deletes expired refresh tokens for the user", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-cleanup-create",
			});

			await db.insert(refreshTokensTable).values({
				userId: user.id,
				tokenHash: hashToken("expired-create-token"),
				expiresAt: subDays(new Date(), 1),
			});

			await authService.createSession({
				id: user.id,
				email: user.email,
			});

			const rows = await db
				.select()
				.from(refreshTokensTable)
				.where(eq(refreshTokensTable.userId, user.id));

			expect(rows).toHaveLength(1);
			expect(rows[0]?.expiresAt.getTime()).toBeGreaterThan(Date.now());
			expect(rows[0]?.tokenHash).not.toBe(hashToken("expired-create-token"));
		});
	});

	describe("refresh session", () => {
		it("rotates refresh token and returns a new access token", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-refresh",
			});

			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			const refreshed = await authService.refreshSession(session.refreshToken);

			expect(refreshed.refreshToken).not.toBe(session.refreshToken);
			expect(refreshed.sessionId).toBe(session.sessionId);

			const [active] = await db
				.select()
				.from(refreshTokensTable)
				.where(
					eq(refreshTokensTable.tokenHash, hashToken(refreshed.refreshToken)),
				)
				.limit(1);

			expect(active?.sessionId).toBe(session.sessionId);

			await expect(
				authService.refreshSession(session.refreshToken),
			).rejects.toThrow(RefreshTokenReuseError);
		});

		it("keeps unexpired revoked tokens so reuse can be detected", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-keep-revoked",
			});

			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});
			const previousHash = hashToken(session.refreshToken);

			await authService.refreshSession(session.refreshToken);

			const [revoked] = await db
				.select()
				.from(refreshTokensTable)
				.where(eq(refreshTokensTable.tokenHash, previousHash))
				.limit(1);

			expect(revoked).toBeDefined();
			expect(revoked?.revokedAt).toBeInstanceOf(Date);
		});

		it("deletes expired refresh tokens for the user on rotate", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-cleanup-refresh",
			});

			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			await db.insert(refreshTokensTable).values({
				userId: user.id,
				tokenHash: hashToken("expired-refresh-token"),
				expiresAt: subDays(new Date(), 2),
			});

			await authService.refreshSession(session.refreshToken);

			const expiredRows = await db
				.select()
				.from(refreshTokensTable)
				.where(
					eq(refreshTokensTable.tokenHash, hashToken("expired-refresh-token")),
				);

			expect(expiredRows).toHaveLength(0);

			const activeRows = await db
				.select()
				.from(refreshTokensTable)
				.where(
					and(
						eq(refreshTokensTable.userId, user.id),
						isNull(refreshTokensTable.revokedAt),
					),
				);

			expect(activeRows).toHaveLength(1);
		});

		it("revokes all active sessions when a rotated refresh token is reused", async () => {
			publishAuthSessionRevoked.mockClear();
			publishAuthSessionRevoked.mockResolvedValue(true);

			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-refresh-reuse",
			});

			const firstSession = await authService.createSession({
				id: user.id,
				email: user.email,
			});
			const secondSession = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			const rotated = await authService.refreshSession(
				firstSession.refreshToken,
			);

			await expect(
				authService.refreshSession(firstSession.refreshToken),
			).rejects.toSatisfy((error: unknown) => {
				expect(error).toBeInstanceOf(RefreshTokenReuseError);
				if (!(error instanceof RefreshTokenReuseError)) {
					return false;
				}
				expect(error.userId).toBe(user.id);
				expect(error.sessionId).toBe(firstSession.sessionId);
				return true;
			});

			expect(publishAuthSessionRevoked).toHaveBeenCalledWith({
				userId: user.id,
				scope: "user",
				targetId: user.id,
			});

			await expect(
				authService.refreshSession(rotated.refreshToken),
			).rejects.toThrow(UnauthorizedException);
			await expect(
				authService.refreshSession(secondSession.refreshToken),
			).rejects.toThrow(UnauthorizedException);
		});

		it("still rejects reuse when SSE publish fails", async () => {
			publishAuthSessionRevoked.mockClear();
			publishAuthSessionRevoked.mockRejectedValueOnce(new Error("redis down"));

			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-refresh-reuse-publish-fail",
			});

			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});
			await authService.refreshSession(session.refreshToken);

			await expect(
				authService.refreshSession(session.refreshToken),
			).rejects.toThrow(RefreshTokenReuseError);
		});
	});

	describe("logout session", () => {
		it("revokes the current refresh token and leaves other sessions active", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-logout",
			});

			const firstSession = await authService.createSession({
				id: user.id,
				email: user.email,
			});
			const secondSession = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			const capture = await authService.logoutSession(
				firstSession.refreshToken,
			);

			expect(capture).toEqual({
				userId: user.id,
				sessionId: firstSession.sessionId,
			});

			const [revoked] = await db
				.select()
				.from(refreshTokensTable)
				.where(
					eq(
						refreshTokensTable.tokenHash,
						hashToken(firstSession.refreshToken),
					),
				)
				.limit(1);

			expect(revoked?.revokedAt).toBeInstanceOf(Date);

			const stillActive = await authService.refreshSession(
				secondSession.refreshToken,
			);
			expect(stillActive.refreshToken).not.toBe(secondSession.refreshToken);
			expect(stillActive.sessionId).toBe(secondSession.sessionId);
		});

		it("returns null when the refresh token is missing or already revoked", async () => {
			await expect(authService.logoutSession(null)).resolves.toBeNull();

			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-logout-idempotent",
			});
			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			await authService.logoutSession(session.refreshToken);
			await expect(
				authService.logoutSession(session.refreshToken),
			).resolves.toBeNull();
		});
	});

	describe("logout", () => {
		beforeEach(() => {
			publishAuthSessionRevoked.mockClear();
			publishAuthSessionRevoked.mockResolvedValue(true);
		});

		it("publishes session-scoped revoke after logout and clears the cookie", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-logout-publish",
			});
			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});
			const clearCookie = vi.fn();

			await expect(
				authService.logout(
					{
						cookies: {
							[REFRESH_TOKEN_COOKIE_NAME]: session.refreshToken,
						},
					} as never,
					{ clearCookie } as never,
				),
			).resolves.toEqual({ data: { message: "logged_out" } });

			expect(publishAuthSessionRevoked).toHaveBeenCalledWith({
				userId: user.id,
				scope: "session",
				targetId: session.sessionId,
			});
			expect(clearCookie).toHaveBeenCalled();
		});

		it("still returns success when SSE publish fails", async () => {
			publishAuthSessionRevoked.mockRejectedValueOnce(new Error("redis down"));

			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-logout-publish-fail",
			});
			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			await expect(
				authService.logout(
					{
						cookies: {
							[REFRESH_TOKEN_COOKIE_NAME]: session.refreshToken,
						},
					} as never,
					{ clearCookie: vi.fn() } as never,
				),
			).resolves.toEqual({ data: { message: "logged_out" } });
		});

		it("still returns success when SSE publish reports unavailable", async () => {
			publishAuthSessionRevoked.mockResolvedValueOnce(false);

			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-logout-publish-false",
			});
			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			await expect(
				authService.logout(
					{
						cookies: {
							[REFRESH_TOKEN_COOKIE_NAME]: session.refreshToken,
						},
					} as never,
					{ clearCookie: vi.fn() } as never,
				),
			).resolves.toEqual({ data: { message: "logged_out" } });
		});

		it("does not publish when there is no active refresh session", async () => {
			await expect(
				authService.logout(
					{ cookies: {} } as never,
					{ clearCookie: vi.fn() } as never,
				),
			).resolves.toEqual({ data: { message: "logged_out" } });

			expect(publishAuthSessionRevoked).not.toHaveBeenCalled();
		});
	});

	describe("resolve active refresh session", () => {
		it("returns userId and sessionId for a valid refresh cookie", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-resolve-session",
			});
			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			const resolved = await authService.resolveActiveRefreshSession({
				cookies: { "wealth.auth.refresh": session.refreshToken },
			} as never);

			expect(resolved).toEqual({
				userId: user.id,
				sessionId: session.sessionId,
			});
		});

		it("returns null for missing, revoked, or expired refresh tokens", async () => {
			await expect(
				authService.resolveActiveRefreshSession({ cookies: {} } as never),
			).resolves.toBeNull();

			const user = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("secret", 10),
				emailTag: "auth-resolve-invalid",
			});
			const session = await authService.createSession({
				id: user.id,
				email: user.email,
			});

			await authService.logoutSession(session.refreshToken);
			await expect(
				authService.resolveActiveRefreshSession({
					cookies: { "wealth.auth.refresh": session.refreshToken },
				} as never),
			).resolves.toBeNull();

			await db.insert(refreshTokensTable).values({
				userId: user.id,
				sessionId: session.sessionId,
				tokenHash: hashToken("expired-resolve-token"),
				expiresAt: subDays(new Date(), 1),
			});

			await expect(
				authService.resolveActiveRefreshSession({
					cookies: { "wealth.auth.refresh": "expired-resolve-token" },
				} as never),
			).resolves.toBeNull();
		});
	});

	describe("sign up", () => {
		it("rejects when email is already registered", async () => {
			const existing = await createTestUser(usersService, {
				passwordHash: await bcrypt.hash("x", 10),
				emailTag: "auth-signup-conflict",
			});

			await expect(
				authService.signUp({
					email: existing.email,
					password: "password123",
					confirmPassword: "password123",
				}),
			).rejects.toThrow("Email already registered");
		});

		it("creates user and returns success payload", async () => {
			const email = uniqueTestUserEmail("signup");
			const result = await authService.signUp({
				email,
				password: "password123",
				confirmPassword: "password123",
			});

			expect(result).toEqual({ data: { message: "user_created" } });

			const row = await usersService.findUserByEmail(email);
			expect(row).not.toBeNull();
			if (row === null) throw new Error("expected user row");
			expect(row.email).toBe(email);
			const match = await bcrypt.compare("password123", row.password);
			expect(match).toBe(true);
		});
	});
});
