import { Test, type TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DBS } from "../database-service/constants.js";
import {
	expenseDocumentsTable,
	expenseLineItemsTable,
} from "../database-service/tables/index.js";
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

	describe("create expense by user id", () => {
		it("creates expense document with computed total and line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "exp-create",
			});

			const payload = {
				date: new Date("2026-05-01T10:00:00.000Z"),
				lineItems: [
					{ title: "Taxi", quantity: 2, singleAmount: 12.5 },
					{ title: "Lunch", quantity: 1, singleAmount: 30 },
				],
			};

			await expect(
				expensesService.createExpenseByUserId(user.id, payload),
			).resolves.toEqual({
				data: { message: "expense_created" },
			});

			const [createdDocument] = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.userId, user.id))
				.orderBy(expenseDocumentsTable.createdAt);

			expect(createdDocument).toBeDefined();
			expect(createdDocument?.totalAmount).toBe("55.00");
			expect(createdDocument?.expenseDate).toEqual(payload.date);
			if (!createdDocument) {
				throw new Error("Expected created document");
			}

			const createdLineItems = await db
				.select()
				.from(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, createdDocument.id));

			expect(createdLineItems).toHaveLength(2);
			expect(createdLineItems).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						title: "Taxi",
						quantity: 2,
						singleAmount: "12.50",
					}),
					expect.objectContaining({
						title: "Lunch",
						quantity: 1,
						singleAmount: "30.00",
					}),
				]),
			);
		});

		it("exposes newly created document in user list response", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "exp-create-list",
			});

			const payload = {
				date: new Date("2026-05-02T12:30:00.000Z"),
				lineItems: [{ title: "Coffee", quantity: 3, singleAmount: 4 }],
			};

			await expensesService.createExpenseByUserId(user.id, payload);
			const result = await expensesService.listExpenseDocumentsByUserId(
				user.id,
			);

			expect(result.pagination).toEqual({});
			expect(result.data).toHaveLength(1);
			expect(result.data[0]).toMatchObject({
				date: payload.date,
				totalAmount: 12,
			});
		});

		it("throws when user does not exist", async () => {
			const missingUserId = "01K1MISSINGUSER000000000000";
			const payload = {
				date: new Date("2026-05-03T09:00:00.000Z"),
				lineItems: [{ title: "Train", quantity: 1, singleAmount: 15 }],
			};

			await expect(
				expensesService.createExpenseByUserId(missingUserId, payload),
			).rejects.toThrow();
		});

		it("does not persist expense document when create fails", async () => {
			const db = moduleRef.get(DBS.APP);
			const missingUserId = "01K1MISSINGUSER000000000000";
			const payload = {
				date: new Date("2026-05-03T09:00:00.000Z"),
				lineItems: [{ title: "Train", quantity: 1, singleAmount: 15 }],
			};

			const beforeDocs = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.userId, missingUserId));

			await expect(
				expensesService.createExpenseByUserId(missingUserId, payload),
			).rejects.toThrow();

			const afterDocs = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.userId, missingUserId));

			expect(beforeDocs).toHaveLength(0);
			expect(afterDocs).toHaveLength(0);
		});
	});

	describe("delete expense by user id", () => {
		it("deletes only user's own expense and returns success response", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `delete-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `delete-other-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [ownerExpense] = await db
				.insert(expenseDocumentsTable)
				.values({
					userId: owner.id,
					totalAmount: "20.00",
					expenseDate: new Date("2026-05-04T09:00:00.000Z"),
				})
				.returning({ id: expenseDocumentsTable.id });

			const [otherExpense] = await db
				.insert(expenseDocumentsTable)
				.values({
					userId: otherUser.id,
					totalAmount: "30.00",
					expenseDate: new Date("2026-05-05T10:00:00.000Z"),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!ownerExpense || !otherExpense) {
				throw new Error("Expected seeded expenses");
			}

			await db.insert(expenseLineItemsTable).values({
				expenseDocumentId: ownerExpense.id,
				title: "Line item to delete",
				quantity: 1,
				singleAmount: "20.00",
			});

			await expect(
				expensesService.deleteExpenseByUserId(owner.id, ownerExpense.id),
			).resolves.toEqual({
				data: { message: "expense_deleted" },
			});

			const ownerExpenseAfterDelete = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.id, ownerExpense.id));
			expect(ownerExpenseAfterDelete).toHaveLength(0);

			const ownerLineItemsAfterDelete = await db
				.select()
				.from(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, ownerExpense.id));
			expect(ownerLineItemsAfterDelete).toHaveLength(0);

			const otherExpenseAfterDelete = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.id, otherExpense.id));
			expect(otherExpenseAfterDelete).toHaveLength(1);
		});

		it("throws when expense does not belong to the user", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `delete-owner-scope-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `delete-other-scope-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [otherExpense] = await db
				.insert(expenseDocumentsTable)
				.values({
					userId: otherUser.id,
					totalAmount: "44.00",
					expenseDate: new Date("2026-05-06T08:00:00.000Z"),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!otherExpense) {
				throw new Error("Expected seeded expense");
			}

			await expect(
				expensesService.deleteExpenseByUserId(owner.id, otherExpense.id),
			).rejects.toThrow("Expense not found");

			const expenseStillExists = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.id, otherExpense.id));
			expect(expenseStillExists).toHaveLength(1);
		});
	});

	describe("update expense by user id", () => {
		it("updates expense date, total amount, and replaces line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "exp-update",
			});

			const [expense] = await db
				.insert(expenseDocumentsTable)
				.values({
					userId: user.id,
					totalAmount: "20.00",
					expenseDate: new Date("2024-01-01T12:00:00.000Z"),
					createdAt: new Date("2024-01-01T12:00:00.000Z"),
					updatedAt: new Date("2024-01-02T12:00:00.000Z"),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!expense) {
				throw new Error("Expected seeded expense");
			}

			await db.insert(expenseLineItemsTable).values({
				expenseDocumentId: expense.id,
				title: "Old item",
				quantity: 1,
				singleAmount: "20.00",
			});

			const newDate = new Date("2025-06-15T08:00:00.000Z");
			const payload = {
				date: newDate,
				lineItems: [{ title: "Train", quantity: 2, singleAmount: 15 }],
			};

			await expect(
				expensesService.updateExpenseByUserId(user.id, expense.id, payload),
			).resolves.toEqual({
				data: { message: "expense_updated" },
			});

			const [docAfter] = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.id, expense.id));

			expect(docAfter?.totalAmount).toBe("30.00");
			expect(docAfter?.expenseDate).toEqual(newDate);

			const lineItemsAfter = await db
				.select()
				.from(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, expense.id));

			expect(lineItemsAfter).toHaveLength(1);
			expect(lineItemsAfter[0]).toMatchObject({
				title: "Train",
				quantity: 2,
				singleAmount: "15.00",
			});
		});

		it("keeps date and total amount unchanged when the computed values are unchanged, but still replaces line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "exp-update-skip-doc",
			});

			const expenseDate = new Date("2026-05-10T10:00:00.000Z");
			const [expense] = await db
				.insert(expenseDocumentsTable)
				.values({
					userId: user.id,
					totalAmount: "55.00",
					expenseDate,
					createdAt: new Date("2026-05-10T10:00:00.000Z"),
					updatedAt: new Date("2024-03-01T15:00:00.000Z"),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!expense) {
				throw new Error("Expected seeded expense");
			}

			await db.insert(expenseLineItemsTable).values([
				{
					expenseDocumentId: expense.id,
					title: "Taxi",
					quantity: 2,
					singleAmount: "12.50",
				},
				{
					expenseDocumentId: expense.id,
					title: "Lunch",
					quantity: 1,
					singleAmount: "30.00",
				},
			]);

			const payload = {
				date: expenseDate,
				lineItems: [{ title: "Coffee", quantity: 11, singleAmount: 5 }],
			};

			await expensesService.updateExpenseByUserId(user.id, expense.id, payload);

			const [docAfter] = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.id, expense.id));

			expect(docAfter?.totalAmount).toBe("55.00");
			expect(docAfter?.expenseDate).toEqual(expenseDate);

			const lineItemsAfter = await db
				.select()
				.from(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, expense.id));

			expect(lineItemsAfter).toHaveLength(1);
			expect(lineItemsAfter[0]).toMatchObject({
				title: "Coffee",
				quantity: 11,
				singleAmount: "5.00",
			});
		});

		it("throws when expense does not belong to the user", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `update-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `update-other-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [otherExpense] = await db
				.insert(expenseDocumentsTable)
				.values({
					userId: otherUser.id,
					totalAmount: "22.00",
					expenseDate: new Date("2026-05-07T08:00:00.000Z"),
				})
				.returning({ id: expenseDocumentsTable.id });

			if (!otherExpense) {
				throw new Error("Expected seeded expense");
			}

			await db.insert(expenseLineItemsTable).values({
				expenseDocumentId: otherExpense.id,
				title: "Item",
				quantity: 1,
				singleAmount: "22.00",
			});

			await expect(
				expensesService.updateExpenseByUserId(owner.id, otherExpense.id, {
					date: new Date("2026-05-08T08:00:00.000Z"),
					lineItems: [{ title: "X", quantity: 1, singleAmount: 10 }],
				}),
			).rejects.toThrow("Expense not found");

			const expenseStillExists = await db
				.select()
				.from(expenseDocumentsTable)
				.where(eq(expenseDocumentsTable.id, otherExpense.id));
			expect(expenseStillExists).toHaveLength(1);

			const lineItemsUnchanged = await db
				.select()
				.from(expenseLineItemsTable)
				.where(eq(expenseLineItemsTable.expenseDocumentId, otherExpense.id));
			expect(lineItemsUnchanged).toHaveLength(1);
			expect(lineItemsUnchanged[0]?.title).toBe("Item");
		});
	});
});
