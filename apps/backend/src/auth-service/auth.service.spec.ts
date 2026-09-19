import { createHash } from "node:crypto";
import { UnauthorizedException } from "@nestjs/common";
import {
	AUTH_COOKIE_PATH,
	REFRESH_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "@repo/common/constants";
import * as bcrypt from "bcrypt";
import { subSeconds } from "date-fns";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { CookieOptions, Request, Response } from "express";
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
import { sessionsTable } from "../database-service/tables/index.js";
import { SsePublisher } from "../sse-service/sse-publisher.service.js";
import { createAuthTestingModule } from "../test/helpers/modules.js";
import { createTestUser, uniqueTestUserEmail } from "../test/mocks/users.js";
import { UsersService } from "../users-service/users.service.js";
import { AuthService, type RpcSession } from "./auth.service.js";

const PASSWORD = "secret";

const hashToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

const createCookieJar = () => {
	const cookies: Record<string, string> = {};
	const cookie = vi.fn(
		(name: string, value: string, _options?: CookieOptions) => {
			cookies[name] = value;
		},
	);
	const clearCookie = vi.fn((name: string, _options?: CookieOptions) => {
		delete cookies[name];
	});

	return { cookies, cookie, clearCookie };
};

type CookieJar = ReturnType<typeof createCookieJar>;

const asRequest = (
	cookies: Record<string, string | undefined>,
	user?: RpcSession,
): Request => ({ cookies, user }) as unknown as Request;

const asResponse = (jar: CookieJar): Response =>
	({ cookie: jar.cookie, clearCookie: jar.clearCookie }) as unknown as Response;

const laxCookieOptions = {
	httpOnly: true,
	secure: false,
	sameSite: "lax" as const,
	path: AUTH_COOKIE_PATH,
};

describe("Auth service", () => {
	let moduleRef: Awaited<ReturnType<typeof createAuthTestingModule>>;
	let authService: AuthService;
	let usersService: UsersService;
	let db: NodePgDatabase;
	let publishSessionEnded: ReturnType<typeof vi.fn>;

	beforeAll(async () => {
		moduleRef = await createAuthTestingModule();
		authService = moduleRef.get(AuthService);
		usersService = moduleRef.get(UsersService);
		db = moduleRef.get(DBS.APP);
		publishSessionEnded = vi.mocked(
			moduleRef.get(SsePublisher).publishSessionEnded,
		);
	});

	beforeEach(() => {
		publishSessionEnded.mockClear();
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	const createUser = async (emailTag: string) =>
		createTestUser(usersService, {
			passwordHash: await bcrypt.hash(PASSWORD, 10),
			emailTag,
		});

	const signIn = async (
		user: { email: string },
		jar: CookieJar,
		requestCookies = { ...jar.cookies },
	) =>
		authService.signIn(
			{ email: user.email, password: PASSWORD },
			asRequest(requestCookies),
			asResponse(jar),
		);

	const refresh = (refreshToken: string, jar: CookieJar) =>
		authService.refresh(
			asRequest({ [REFRESH_COOKIE_NAME]: refreshToken }),
			asResponse(jar),
		);

	const sessionsForUser = async (userId: string) =>
		db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId));

	const sessionByRefreshToken = async (refreshToken: string) => {
		const [row] = await db
			.select()
			.from(sessionsTable)
			.where(eq(sessionsTable.refreshHash, hashToken(refreshToken)))
			.limit(1);
		return row ?? null;
	};

	describe("sign-in", () => {
		it("sets session and refresh cookies and returns a snapshot", async () => {
			const user = await createUser("auth-cookie-dev");
			const jar = createCookieJar();

			const result = await signIn(user, jar);

			expect(result.data.user).toEqual({
				id: user.id,
				email: user.email,
				firstName: null,
				lastName: null,
			});
			expect(new Date(result.data.sessionExpiresAt).toISOString()).toBe(
				result.data.sessionExpiresAt,
			);
			expect(jar.cookies[SESSION_COOKIE_NAME]?.length).toBeGreaterThan(0);
			expect(jar.cookies[REFRESH_COOKIE_NAME]?.length).toBeGreaterThan(0);
			expect(jar.cookie.mock.calls[0]?.[2]).toMatchObject(laxCookieOptions);
			expect(jar.cookie.mock.calls[1]?.[2]).toMatchObject(laxCookieOptions);
		});

		it("sets SameSite=None and Secure=true in production", async () => {
			const user = await createUser("auth-cookie-prod");
			const jar = createCookieJar();
			const previousNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			try {
				await signIn(user, jar);
			} finally {
				process.env.NODE_ENV = previousNodeEnv;
			}

			expect(jar.cookie.mock.calls[0]?.[2]).toMatchObject({
				secure: true,
				sameSite: "none",
			});
		});

		it("ends the previous session when signing in with an existing refresh cookie", async () => {
			const user = await createUser("auth-replace-session");
			const jar = createCookieJar();
			await signIn(user, jar);
			const [previous] = await sessionsForUser(user.id);
			const previousRefresh = jar.cookies[REFRESH_COOKIE_NAME];

			await signIn(user, createCookieJar(), {
				[REFRESH_COOKIE_NAME]: previousRefresh,
			});

			expect(publishSessionEnded).toHaveBeenCalledWith({
				userId: user.id,
				targetId: previous?.id,
			});
			expect(await sessionByRefreshToken(previousRefresh)).toBeNull();
		});
	});

	describe("refresh", () => {
		it("rotates hashes in place and returns a snapshot", async () => {
			const user = await createUser("auth-refresh");
			const jar = createCookieJar();
			await signIn(user, jar);
			const previousRefresh = jar.cookies[REFRESH_COOKIE_NAME];
			const previousHash = hashToken(previousRefresh);

			jar.cookie.mockClear();
			const snapshot = await refresh(previousRefresh, jar);
			const [row] = await sessionsForUser(user.id);

			expect(snapshot.data.user).toEqual({
				id: user.id,
				email: user.email,
				firstName: null,
				lastName: null,
			});
			expect(row?.refreshHash).toBe(
				hashToken(jar.cookies[REFRESH_COOKIE_NAME]),
			);
			expect(row?.previousRefreshHash).toBe(previousHash);
			expect(jar.cookies[REFRESH_COOKIE_NAME]).not.toBe(previousRefresh);
		});

		it("returns the same session during grace without rotating again", async () => {
			const user = await createUser("auth-grace");
			const jar = createCookieJar();
			await signIn(user, jar);
			const originalRefresh = jar.cookies[REFRESH_COOKIE_NAME];

			await refresh(originalRefresh, jar);
			const [afterWin] = await sessionsForUser(user.id);
			jar.cookie.mockClear();

			await refresh(originalRefresh, jar);
			const [afterGrace] = await sessionsForUser(user.id);

			expect(afterGrace?.id).toBe(afterWin?.id);
			expect(afterGrace?.refreshHash).toBe(afterWin?.refreshHash);
			expect(jar.cookie).not.toHaveBeenCalled();
		});

		it("deletes only the reused session after grace", async () => {
			const user = await createUser("auth-reuse");
			const firstJar = createCookieJar();
			const secondJar = createCookieJar();
			await signIn(user, firstJar);
			await signIn(user, secondJar);
			const firstRefresh = firstJar.cookies[REFRESH_COOKIE_NAME];
			const secondRefresh = secondJar.cookies[REFRESH_COOKIE_NAME];

			await refresh(firstRefresh, firstJar);
			const [rotated] = await db
				.select()
				.from(sessionsTable)
				.where(eq(sessionsTable.previousRefreshHash, hashToken(firstRefresh)))
				.limit(1);
			await db
				.update(sessionsTable)
				.set({ previousRefreshValidUntil: subSeconds(new Date(), 1) })
				.where(eq(sessionsTable.id, rotated?.id ?? ""));

			await expect(
				refresh(firstRefresh, createCookieJar()),
			).rejects.toBeInstanceOf(UnauthorizedException);
			expect(publishSessionEnded).toHaveBeenCalledWith({
				userId: user.id,
				targetId: rotated?.id,
			});

			const other = await refresh(secondRefresh, createCookieJar());
			expect(other.data.user.id).toBe(user.id);
		});

		it("rejects an unknown refresh token without ending a session", async () => {
			await expect(
				refresh("unknown-refresh-token", createCookieJar()),
			).rejects.toBeInstanceOf(UnauthorizedException);
			expect(publishSessionEnded).not.toHaveBeenCalled();
		});
	});

	describe("logout", () => {
		it("deletes the current session, publishes, and clears both cookies", async () => {
			const user = await createUser("auth-logout");
			const jar = createCookieJar();
			await signIn(user, jar);
			const [session] = await sessionsForUser(user.id);
			const refreshToken = jar.cookies[REFRESH_COOKIE_NAME];

			await expect(
				authService.logout(
					asRequest({ [REFRESH_COOKIE_NAME]: refreshToken }),
					asResponse(jar),
				),
			).resolves.toBeUndefined();

			expect(publishSessionEnded).toHaveBeenCalledWith({
				userId: user.id,
				targetId: session?.id,
			});
			expect(jar.clearCookie.mock.calls).toEqual([
				[SESSION_COOKIE_NAME, laxCookieOptions],
				[REFRESH_COOKIE_NAME, laxCookieOptions],
			]);
			expect(await sessionByRefreshToken(refreshToken)).toBeNull();
		});

		it("is idempotent when there is no session", async () => {
			const jar = createCookieJar();

			await expect(
				authService.logout(asRequest({}), asResponse(jar)),
			).resolves.toBeUndefined();
			expect(publishSessionEnded).not.toHaveBeenCalled();
			expect(jar.clearCookie.mock.calls.map(([name]) => name)).toEqual([
				SESSION_COOKIE_NAME,
				REFRESH_COOKIE_NAME,
			]);
		});
	});

	describe("me", () => {
		it("returns the same snapshot as sign-in for the resolved session", async () => {
			const user = await createUser("auth-me");
			const jar = createCookieJar();
			const signedIn = await signIn(user, jar);
			const session = await authService.resolveRpcSession(
				asRequest({
					[SESSION_COOKIE_NAME]: jar.cookies[SESSION_COOKIE_NAME],
				}),
			);

			expect(session).toMatchObject({ userId: user.id });
			await expect(
				authService.me(asRequest({}, session ?? undefined)),
			).resolves.toEqual(signedIn);
		});

		it("rejects when the request has no resolved session", async () => {
			await expect(authService.me(asRequest({}))).rejects.toBeInstanceOf(
				UnauthorizedException,
			);
		});
	});

	describe("resolveRpcSession", () => {
		it("returns null when the session cookie has expired", async () => {
			const user = await createUser("auth-me-expired");
			const jar = createCookieJar();
			await signIn(user, jar);
			const [row] = await sessionsForUser(user.id);

			await db
				.update(sessionsTable)
				.set({ sessionExpiresAt: subSeconds(new Date(), 1) })
				.where(eq(sessionsTable.id, row?.id ?? ""));

			await expect(
				authService.resolveRpcSession(
					asRequest({
						[SESSION_COOKIE_NAME]: jar.cookies[SESSION_COOKIE_NAME],
					}),
				),
			).resolves.toBeNull();
		});
	});

	describe("update password", () => {
		const NEW_PASSWORD = "Secret1!";

		it("updates the hash, keeps the current session, and ends others", async () => {
			const user = await createUser("auth-password-update");
			const currentJar = createCookieJar();
			const otherJar = createCookieJar();

			await signIn(user, currentJar);
			await signIn(user, otherJar);

			const currentRefresh = currentJar.cookies[REFRESH_COOKIE_NAME];
			const otherRefresh = otherJar.cookies[REFRESH_COOKIE_NAME];
			const currentSession = await authService.resolveRpcSession(
				asRequest({
					[SESSION_COOKIE_NAME]: currentJar.cookies[SESSION_COOKIE_NAME],
				}),
			);
			const otherSession = await sessionByRefreshToken(otherRefresh);

			await expect(
				authService.updatePassword(
					{
						currentPassword: PASSWORD,
						newPassword: NEW_PASSWORD,
						confirmPassword: NEW_PASSWORD,
					},
					asRequest({}, currentSession ?? undefined),
				),
			).resolves.toEqual({ data: { message: "user_password_updated" } });

			expect(publishSessionEnded).toHaveBeenCalledWith({
				userId: user.id,
				targetId: otherSession?.id,
			});

			expect(await sessionByRefreshToken(otherRefresh)).toBeNull();
			expect(await sessionByRefreshToken(currentRefresh)).not.toBeNull();

			await expect(
				authService.signIn(
					{ email: user.email, password: NEW_PASSWORD },
					asRequest({}),
					asResponse(createCookieJar()),
				),
			).resolves.toMatchObject({ data: { user: { id: user.id } } });
		});

		it("rejects an invalid current password without ending sessions", async () => {
			const user = await createUser("auth-password-invalid");
			const jar = createCookieJar();

			await signIn(user, jar);
			const session = await authService.resolveRpcSession(
				asRequest({
					[SESSION_COOKIE_NAME]: jar.cookies[SESSION_COOKIE_NAME],
				}),
			);

			await expect(
				authService.updatePassword(
					{
						currentPassword: "wrong-password",
						newPassword: NEW_PASSWORD,
						confirmPassword: NEW_PASSWORD,
					},
					asRequest({}, session ?? undefined),
				),
			).rejects.toBeInstanceOf(UnauthorizedException);

			expect(publishSessionEnded).not.toHaveBeenCalled();
			expect(await sessionsForUser(user.id)).toHaveLength(1);
		});
	});

	describe("sign up", () => {
		it("rejects when email is already registered", async () => {
			const existing = await createUser("auth-signup-conflict");

			await expect(
				authService.signUp({
					email: existing.email,
					password: "password123",
					confirmPassword: "password123",
				}),
			).rejects.toThrow("Email already registered");
		});

		it("creates user without a session", async () => {
			const email = uniqueTestUserEmail("signup");
			const result = await authService.signUp({
				email,
				password: "password123",
				confirmPassword: "password123",
				firstName: "Ada",
				lastName: "Lovelace",
			});

			expect(result).toEqual({ data: { message: "user_created" } });
			const row = await usersService.findUserByEmail(email);
			expect(row?.email).toBe(email);
			expect(row?.firstName).toBe("Ada");
			expect(row?.lastName).toBe("Lovelace");
			expect(await sessionsForUser(String(row?.id))).toEqual([]);
		});
	});
});
