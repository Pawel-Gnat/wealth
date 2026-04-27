import { UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { ORPCError } from "@orpc/server";
import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UsersService } from "../users/users.service.js";
import { AuthService } from "./auth.service.js";

vi.mock("bcrypt", () => ({
	compare: vi.fn(),
	hash: vi.fn(),
}));

describe("AuthService", () => {
	let authService: AuthService;
	let usersService: {
		findUserByEmail: ReturnType<typeof vi.fn>;
		createUser: ReturnType<typeof vi.fn>;
	};
	let jwtService: { signAsync: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		usersService = {
			findUserByEmail: vi.fn(),
			createUser: vi.fn(),
		};
		jwtService = {
			signAsync: vi.fn().mockResolvedValue("test-jwt"),
		};
		authService = new AuthService(
			usersService as unknown as UsersService,
			jwtService as unknown as JwtService,
		);
		vi.mocked(bcrypt.compare).mockReset();
		vi.mocked(bcrypt.hash).mockReset();
	});

	describe("validateUser", () => {
		it("throws when user is not found", async () => {
			usersService.findUserByEmail.mockResolvedValue(null);

			await expect(
				authService.validateUser({
					email: "missing@example.com",
					password: "secret",
				}),
			).rejects.toThrow(UnauthorizedException);

			expect(bcrypt.compare).not.toHaveBeenCalled();
		});

		it("throws when password does not match", async () => {
			usersService.findUserByEmail.mockResolvedValue({
				id: 1,
				email: "user@example.com",
				password: "hash",
			});
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(
				authService.validateUser({
					email: "user@example.com",
					password: "wrong",
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it("returns user when credentials are valid", async () => {
			usersService.findUserByEmail.mockResolvedValue({
				id: 42,
				email: "user@example.com",
				password: "hash",
			});
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			await expect(
				authService.validateUser({
					email: "user@example.com",
					password: "ok",
				}),
			).resolves.toEqual({
				id: "42",
				email: "user@example.com",
			});
		});
	});

	describe("signInForVerifiedUser", () => {
		it("returns a JWT for the user", async () => {
			const result = await authService.signInForVerifiedUser({
				id: "7",
				email: "verified@example.com",
			});

			expect(jwtService.signAsync).toHaveBeenCalledWith({
				email: "verified@example.com",
				sub: "7",
			});
			expect(result).toEqual({ data: { token: "test-jwt" } });
		});
	});

	describe("signUp", () => {
		it("rejects when email is already registered", async () => {
			usersService.findUserByEmail.mockResolvedValue({
				id: 1,
				email: "taken@example.com",
				password: "x",
			});

			await expect(
				authService.signUp({
					email: "taken@example.com",
					password: "password123",
					confirmPassword: "password123",
				}),
			).rejects.toBeInstanceOf(ORPCError);

			expect(bcrypt.hash).not.toHaveBeenCalled();
			expect(usersService.createUser).not.toHaveBeenCalled();
		});

		it("creates user and returns success payload", async () => {
			usersService.findUserByEmail.mockResolvedValue(null);
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);

			const result = await authService.signUp({
				email: "new@example.com",
				password: "password123",
				confirmPassword: "password123",
			});

			expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
			expect(usersService.createUser).toHaveBeenCalledWith(
				"new@example.com",
				"hashed-password",
			);
			expect(result).toEqual({ data: { message: "user_created" } });
		});
	});
});
