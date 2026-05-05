import { Test, type TestingModule } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DBS } from "../database-service/constants.js";
import { expenseDocumentsTable } from "../database-service/tables/index.js";
import { createTestUser } from "../test/mocks/users.js";
import { TestModule } from "../test/test.module.js";
import { UsersService } from "../users-service/users.service.js";
import { ExpensesService } from "./expenses.service.js";

describe("Expenses service", () => {
	let moduleRef: TestingModule;
	let expensesService: ExpensesService;
	let usersService: UsersService;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [TestModule],
			providers: [ExpensesService],
		}).compile();
		expensesService = moduleRef.get(ExpensesService);
		usersService = moduleRef.get(UsersService);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	describe("list expense documents by user id", () => {
		it("returns an empty list when the user has no expense documents", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "exp-empty",
			});

			await expect(
				expensesService.listExpenseDocumentsByUserId(user.id),
			).resolves.toEqual({ data: [], pagination: {} });
		});

		it("lists only the requesting user's documents, ordered by expenseDate descending", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const userA = await createTestUser(usersService, {
				email: `user-a-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const userB = await createTestUser(usersService, {
				email: `user-b-${suffix}@example.com`,
				passwordHash: "hash",
			});

			await db.insert(expenseDocumentsTable).values({
				userId: userA.id,
				totalAmount: "100",
				expenseDate: new Date("2024-01-15T08:00:00.000Z"),
				createdAt: new Date("2024-01-15T08:00:00.000Z"),
				updatedAt: new Date("2024-01-16T08:00:00.000Z"),
			});

			await db.insert(expenseDocumentsTable).values({
				userId: userA.id,
				totalAmount: "50.50",
				expenseDate: new Date("2024-06-01T12:00:00.000Z"),
				createdAt: new Date("2024-06-01T12:00:00.000Z"),
				updatedAt: new Date("2024-06-01T12:00:00.000Z"),
			});

			await db.insert(expenseDocumentsTable).values({
				userId: userB.id,
				totalAmount: "9.99",
				expenseDate: new Date("2024-03-01T00:00:00.000Z"),
				createdAt: new Date("2024-03-01T00:00:00.000Z"),
				updatedAt: new Date("2024-03-01T00:00:00.000Z"),
			});

			const forA = await expensesService.listExpenseDocumentsByUserId(userA.id);

			expect(forA.pagination).toEqual({});
			expect(forA.data).toHaveLength(2);

			expect(forA.data[1]).toMatchObject({
				totalAmount: 100,
				date: new Date("2024-01-15T08:00:00.000Z"),
			});

			expect(forA.data[0]).toMatchObject({
				totalAmount: 50.5,
				date: new Date("2024-06-01T12:00:00.000Z"),
			});

			const forB = await expensesService.listExpenseDocumentsByUserId(userB.id);
			expect(forB.pagination).toEqual({});
			expect(forB.data).toHaveLength(1);
		});
	});
});
