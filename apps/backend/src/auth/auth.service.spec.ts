import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ORPCError } from "@orpc/server";
import * as bcrypt from "bcrypt";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAuthTestingModule } from "../test/helpers/modules.js";
import { UsersService } from "../users/users.service.js";
import { AuthService } from "./auth.service.js";

const uniqueEmail = () =>
	`auth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@example.com`;

describe("AuthService", () => {
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

	describe("validateUser", () => {
		it("throws when user is not found", async () => {
			await expect(
				authService.validateUser({
					email: "missing-user-alias@example.com",
					password: "secret",
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it("throws when password does not match", async () => {
			const email = uniqueEmail();
			const hash = await bcrypt.hash("correct-pass", 10);
			await usersService.createUser(email, hash);

			await expect(
				authService.validateUser({
					email,
					password: "wrong",
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it("returns user when credentials are valid", async () => {
			const email = uniqueEmail();
			const plain = "secret-ok";
			const hash = await bcrypt.hash(plain, 10);
			await usersService.createUser(email, hash);

			await expect(
				authService.validateUser({ email, password: plain }),
			).resolves.toEqual({
				id: expect.any(String),
				email,
			});
		});
	});

	describe("signInForVerifiedUser", () => {
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

	describe("signUp", () => {
		it("rejects when email is already registered", async () => {
			const email = uniqueEmail();
			await usersService.createUser(email, await bcrypt.hash("x", 10));

			await expect(
				authService.signUp({
					email,
					password: "password123",
					confirmPassword: "password123",
				}),
			).rejects.toBeInstanceOf(ORPCError);
		});

		it("creates user and returns success payload", async () => {
			const email = uniqueEmail();
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
