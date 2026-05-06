import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ORPCError } from "@orpc/server";
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

	describe("sign in for verified user", () => {
		it("returns a signed JWT", async () => {
			const result = await authService.signInForVerifiedUser({
				id: "7",
				email: "verified@example.com",
			});

			const payload = await jwtService.verifyAsync<{
				sub: string;
				email: string;
			}>(result.data.token);

			expect(payload).toMatchObject({
				sub: "7",
				email: "verified@example.com",
			});
		});
	});

	describe("sign in", () => {
		it("throws UnauthorizedException when credentials are invalid", async () => {
			await expect(
				authService.signIn({
					email: "missing-user-signin@example.com",
					password: "incorrect",
				}),
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
