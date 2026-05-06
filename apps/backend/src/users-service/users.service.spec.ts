import { Test, type TestingModule } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { uniqueTestUserEmail } from "../test/mocks/users.js";
import { TestModule } from "../test/test.module.js";
import { UsersService } from "./users.service.js";

describe("Users service", () => {
	let moduleRef: TestingModule;
	let usersService: UsersService;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [TestModule],
		}).compile();
		usersService = moduleRef.get(UsersService);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	it("findUserByEmail returns null when user does not exist", async () => {
		await expect(
			usersService.findUserByEmail("nonexistent-int-test@example.com"),
		).resolves.toBeNull();
	});

	it("creates a user and finds them by email", async () => {
		const email = uniqueTestUserEmail("users-create");
		const passwordHash = "hashed-for-integration";
		await usersService.createUser(email, passwordHash);

		const row = await usersService.findUserByEmail(email);
		expect(row).not.toBeNull();
		expect(row).toMatchObject({ email, password: passwordHash });
	});

	it("rejects when trying to create user with duplicated email", async () => {
		const email = uniqueTestUserEmail("users-duplicate");
		await usersService.createUser(email, "hash-1");

		await expect(usersService.createUser(email, "hash-2")).rejects.toThrow();
	});
});
