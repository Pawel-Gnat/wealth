import { Test, type TestingModule } from "@nestjs/testing";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DBS } from "../database-service/constants.js";
import { storageTable } from "../database-service/tables/index.js";
import { createTestUser, uniqueTestUserEmail } from "../test/mocks/users.js";
import { TestModule } from "../test/test.module.js";
import { UsersService } from "./users.service.js";

describe("Users service", () => {
	let moduleRef: TestingModule;
	let usersService: UsersService;
	let db: NodePgDatabase;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [TestModule],
		}).compile();
		usersService = moduleRef.get(UsersService);
		db = moduleRef.get(DBS.APP);
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
		await usersService.createUser({ email, passwordHash });

		const row = await usersService.findUserByEmail(email);
		expect(row).not.toBeNull();
		expect(row).toMatchObject({
			email,
			password: passwordHash,
			firstName: null,
			lastName: null,
		});
	});

	it("creates a user with optional names", async () => {
		const row = await createTestUser(usersService, {
			emailTag: "users-create-names",
			passwordHash: "hashed-for-integration",
			firstName: "Ada",
			lastName: "Lovelace",
		});

		expect(row).toMatchObject({
			firstName: "Ada",
			lastName: "Lovelace",
		});
		expect(usersService.mapToUser(row)).toEqual({
			id: row.id,
			email: row.email,
			image: null,
			firstName: "Ada",
			lastName: "Lovelace",
		});
	});

	it("updates first and last name", async () => {
		const created = await createTestUser(usersService, {
			emailTag: "users-update-details",
			passwordHash: "hashed-for-integration",
		});

		await usersService.updateDetails(created.id, {
			firstName: "Ada",
			lastName: "Lovelace",
		});

		const updated = await usersService.findUserById(created.id);
		expect(updated).toMatchObject({
			firstName: "Ada",
			lastName: "Lovelace",
		});
	});

	it("updates image to a storage id", async () => {
		const created = await createTestUser(usersService, {
			emailTag: "users-update-image",
			passwordHash: "hashed-for-integration",
		});

		const [stored] = await db
			.insert(storageTable)
			.values({ objectKey: `avatars/${created.id}/avatar_name.jpg` })
			.returning({ id: storageTable.id });

		expect(stored).toBeDefined();
		if (!stored) {
			throw new Error("storage insert failed");
		}
		await usersService.updateImage(created.id, stored.id);

		const updated = await usersService.findUserById(created.id);
		expect(updated).toBeDefined();
		if (!updated) {
			throw new Error("user not found");
		}
		expect(updated.image).toBe(stored.id);
		expect(usersService.mapToUser(updated).image).toBe(stored.id);
	});

	it("stores empty names as null", async () => {
		const created = await createTestUser(usersService, {
			emailTag: "users-update-details-empty",
			passwordHash: "hashed-for-integration",
			firstName: "Ada",
			lastName: "Lovelace",
		});

		await usersService.updateDetails(created.id, {
			firstName: "",
			lastName: "",
		});

		const updated = await usersService.findUserById(created.id);
		expect(updated).toMatchObject({
			firstName: null,
			lastName: null,
		});
	});

	it("rejects when trying to create user with duplicated email", async () => {
		const email = uniqueTestUserEmail("users-duplicate");
		await usersService.createUser({ email, passwordHash: "hash-1" });

		await expect(
			usersService.createUser({ email, passwordHash: "hash-2" }),
		).rejects.toThrow();
	});
});
