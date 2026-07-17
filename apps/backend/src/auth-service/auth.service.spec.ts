import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAuthTestingModule } from "../test/helpers/modules.js";
import { createTestUser, uniqueTestUserEmail } from "../test/mocks/users.js";
import { UsersService } from "../users-service/users.service.js";
import { AuthService } from "./auth.service.js";

describe("Auth service", () => {
	let moduleRef: Awaited<ReturnType<typeof createAuthTestingModule>>;
	let authService: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;

	beforeAll(async () => {
		moduleRef = await createAuthTestingModule();
		authService = moduleRef.get(AuthService);
		usersService = moduleRef.get(UsersService);
		jwtService = moduleRef.get(JwtService);
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

			await expect(
				authService.refreshSession(session.refreshToken),
			).rejects.toThrow(UnauthorizedException);
		});

		it("revokes all active sessions when a rotated refresh token is reused", async () => {
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
			).rejects.toThrow(UnauthorizedException);

			await expect(
				authService.refreshSession(rotated.refreshToken),
			).rejects.toThrow(UnauthorizedException);
			await expect(
				authService.refreshSession(secondSession.refreshToken),
			).rejects.toThrow(UnauthorizedException);
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
