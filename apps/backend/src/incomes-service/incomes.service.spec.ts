import { Test, type TestingModule } from "@nestjs/testing";
import {
	INCOME_CREATED_MESSAGE,
	INCOME_DELETED_MESSAGE,
	INCOME_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { decodeDocumentDateFromStorage } from "@repo/common/helpers";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DBS } from "../database-service/constants.js";
import {
	incomeDocumentsTable,
	incomeLineItemsTable,
} from "../database-service/tables/index.js";
import { createTestUser } from "../test/mocks/users.js";
import { TestModule } from "../test/test.module.js";
import { UsersService } from "../users-service/users.service.js";
import { IncomesService } from "./incomes.service.js";

describe("Incomes service", () => {
	let moduleRef: TestingModule;
	let incomesService: IncomesService;
	let usersService: UsersService;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [TestModule],
			providers: [IncomesService],
		}).compile();
		incomesService = moduleRef.get(IncomesService);
		usersService = moduleRef.get(UsersService);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	describe("list income documents by user id", () => {
		it("returns an empty list when the user has no income documents", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "inc-empty",
			});

			await expect(
				incomesService.listIncomeDocumentsByUserId(user.id),
			).resolves.toEqual({ data: [], pagination: {} });
		});

		it("lists only the requesting user's documents, ordered by incomeDate descending", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const userA = await createTestUser(usersService, {
				email: `inc-user-a-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const userB = await createTestUser(usersService, {
				email: `inc-user-b-${suffix}@example.com`,
				passwordHash: "hash",
			});

			await db.insert(incomeDocumentsTable).values({
				userId: userA.id,
				totalAmount: "100",
				incomeDate: "2024-01-15",
				createdAt: new Date("2024-01-15T08:00:00.000Z"),
				updatedAt: new Date("2024-01-16T08:00:00.000Z"),
			});

			await db.insert(incomeDocumentsTable).values({
				userId: userA.id,
				totalAmount: "50.50",
				incomeDate: "2024-06-01",
				createdAt: new Date("2024-06-01T12:00:00.000Z"),
				updatedAt: new Date("2024-06-01T12:00:00.000Z"),
			});

			await db.insert(incomeDocumentsTable).values({
				userId: userB.id,
				totalAmount: "9.99",
				incomeDate: "2024-03-01",
				createdAt: new Date("2024-03-01T00:00:00.000Z"),
				updatedAt: new Date("2024-03-01T00:00:00.000Z"),
			});

			const forA = await incomesService.listIncomeDocumentsByUserId(userA.id);

			expect(forA.pagination).toEqual({});
			expect(forA.data).toHaveLength(2);

			expect(forA.data[1]).toMatchObject({
				totalAmount: 100,
				date: decodeDocumentDateFromStorage("2024-01-15"),
			});

			expect(forA.data[0]).toMatchObject({
				totalAmount: 50.5,
				date: decodeDocumentDateFromStorage("2024-06-01"),
			});

			const forB = await incomesService.listIncomeDocumentsByUserId(userB.id);
			expect(forB.pagination).toEqual({});
			expect(forB.data).toHaveLength(1);
		});
	});

	describe("create income by user id", () => {
		it("creates income document with computed total and line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "inc-create",
			});

			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-01"),
				lineItems: [
					{ title: "Salary", quantity: 2, singleAmount: 12.5 },
					{ title: "Bonus", quantity: 1, singleAmount: 30 },
				],
			};

			await expect(
				incomesService.createIncomeByUserId(user.id, payload),
			).resolves.toEqual({
				data: { message: INCOME_CREATED_MESSAGE },
			});

			const [createdDocument] = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.userId, user.id))
				.orderBy(incomeDocumentsTable.createdAt);

			expect(createdDocument).toBeDefined();
			expect(createdDocument?.totalAmount).toBe("55.00");
			expect(createdDocument?.incomeDate).toBe("2026-05-01");
			if (!createdDocument) {
				throw new Error("Expected created document");
			}

			const createdLineItems = await db
				.select()
				.from(incomeLineItemsTable)
				.where(eq(incomeLineItemsTable.incomeDocumentId, createdDocument.id));

			expect(createdLineItems).toHaveLength(2);
			expect(createdLineItems).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						title: "Salary",
						quantity: 2,
						singleAmount: "12.50",
					}),
					expect.objectContaining({
						title: "Bonus",
						quantity: 1,
						singleAmount: "30.00",
					}),
				]),
			);
		});

		it("exposes newly created document in user list response", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "inc-create-list",
			});

			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-02"),
				lineItems: [{ title: "Freelance", quantity: 3, singleAmount: 4 }],
			};

			await incomesService.createIncomeByUserId(user.id, payload);
			const result = await incomesService.listIncomeDocumentsByUserId(user.id);

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
				date: decodeDocumentDateFromStorage("2026-05-03"),
				lineItems: [{ title: "Consulting", quantity: 1, singleAmount: 15 }],
			};

			await expect(
				incomesService.createIncomeByUserId(missingUserId, payload),
			).rejects.toThrow();
		});

		it("does not persist income document when create fails", async () => {
			const db = moduleRef.get(DBS.APP);
			const missingUserId = "01K1MISSINGUSER000000000000";
			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-03"),
				lineItems: [{ title: "Consulting", quantity: 1, singleAmount: 15 }],
			};

			const beforeDocs = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.userId, missingUserId));

			await expect(
				incomesService.createIncomeByUserId(missingUserId, payload),
			).rejects.toThrow();

			const afterDocs = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.userId, missingUserId));

			expect(beforeDocs).toHaveLength(0);
			expect(afterDocs).toHaveLength(0);
		});
	});

	describe("delete income by user id", () => {
		it("deletes only user's own income and returns success response", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `inc-delete-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `inc-delete-other-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [ownerIncome] = await db
				.insert(incomeDocumentsTable)
				.values({
					userId: owner.id,
					totalAmount: "20.00",
					incomeDate: "2026-05-04",
				})
				.returning({ id: incomeDocumentsTable.id });

			const [otherIncome] = await db
				.insert(incomeDocumentsTable)
				.values({
					userId: otherUser.id,
					totalAmount: "30.00",
					incomeDate: "2026-05-05",
				})
				.returning({ id: incomeDocumentsTable.id });

			if (!ownerIncome || !otherIncome) {
				throw new Error("Expected seeded incomes");
			}

			await db.insert(incomeLineItemsTable).values({
				incomeDocumentId: ownerIncome.id,
				title: "Line item to delete",
				quantity: 1,
				singleAmount: "20.00",
			});

			await expect(
				incomesService.deleteIncomeByUserId(owner.id, ownerIncome.id),
			).resolves.toEqual({
				data: { message: INCOME_DELETED_MESSAGE },
			});

			const ownerIncomeAfterDelete = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.id, ownerIncome.id));
			expect(ownerIncomeAfterDelete).toHaveLength(0);

			const ownerLineItemsAfterDelete = await db
				.select()
				.from(incomeLineItemsTable)
				.where(eq(incomeLineItemsTable.incomeDocumentId, ownerIncome.id));
			expect(ownerLineItemsAfterDelete).toHaveLength(0);

			const otherIncomeAfterDelete = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.id, otherIncome.id));
			expect(otherIncomeAfterDelete).toHaveLength(1);
		});

		it("throws when income does not belong to the user", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `inc-delete-owner-scope-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `inc-delete-other-scope-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [otherIncome] = await db
				.insert(incomeDocumentsTable)
				.values({
					userId: otherUser.id,
					totalAmount: "44.00",
					incomeDate: "2026-05-06",
				})
				.returning({ id: incomeDocumentsTable.id });

			if (!otherIncome) {
				throw new Error("Expected seeded income");
			}

			await expect(
				incomesService.deleteIncomeByUserId(owner.id, otherIncome.id),
			).rejects.toThrow("Income not found");

			const incomeStillExists = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.id, otherIncome.id));
			expect(incomeStillExists).toHaveLength(1);
		});
	});

	describe("update income by user id", () => {
		it("updates income date, total amount, and replaces line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "inc-update",
			});

			const [income] = await db
				.insert(incomeDocumentsTable)
				.values({
					userId: user.id,
					totalAmount: "20.00",
					incomeDate: "2024-01-01",
					createdAt: new Date("2024-01-01T12:00:00.000Z"),
					updatedAt: new Date("2024-01-02T12:00:00.000Z"),
				})
				.returning({ id: incomeDocumentsTable.id });

			if (!income) {
				throw new Error("Expected seeded income");
			}

			await db.insert(incomeLineItemsTable).values({
				incomeDocumentId: income.id,
				title: "Old item",
				quantity: 1,
				singleAmount: "20.00",
			});

			const newDate = "2025-06-15";
			const payload = {
				date: decodeDocumentDateFromStorage(newDate),
				lineItems: [{ title: "Royalty", quantity: 2, singleAmount: 15 }],
			};

			await expect(
				incomesService.updateIncomeByUserId(user.id, income.id, payload),
			).resolves.toEqual({
				data: { message: INCOME_UPDATED_MESSAGE },
			});

			const [docAfter] = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.id, income.id));

			expect(docAfter?.totalAmount).toBe("30.00");
			expect(docAfter?.incomeDate).toEqual(newDate);

			const lineItemsAfter = await db
				.select()
				.from(incomeLineItemsTable)
				.where(eq(incomeLineItemsTable.incomeDocumentId, income.id));

			expect(lineItemsAfter).toHaveLength(1);
			expect(lineItemsAfter[0]).toMatchObject({
				title: "Royalty",
				quantity: 2,
				singleAmount: "15.00",
			});
		});

		it("keeps date and total amount unchanged when the computed values are unchanged, but still replaces line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "inc-update-skip-doc",
			});

			const incomeDate = "2026-05-10";
			const [income] = await db
				.insert(incomeDocumentsTable)
				.values({
					userId: user.id,
					totalAmount: "55.00",
					incomeDate,
					createdAt: new Date("2026-05-10T10:00:00.000Z"),
					updatedAt: new Date("2024-03-01T15:00:00.000Z"),
				})
				.returning({ id: incomeDocumentsTable.id });

			if (!income) {
				throw new Error("Expected seeded income");
			}

			await db.insert(incomeLineItemsTable).values([
				{
					incomeDocumentId: income.id,
					title: "Salary piece",
					quantity: 2,
					singleAmount: "12.50",
				},
				{
					incomeDocumentId: income.id,
					title: "Tips",
					quantity: 1,
					singleAmount: "30.00",
				},
			]);

			const payload = {
				date: decodeDocumentDateFromStorage(incomeDate),
				lineItems: [{ title: "Commission", quantity: 11, singleAmount: 5 }],
			};

			await incomesService.updateIncomeByUserId(user.id, income.id, payload);

			const [docAfter] = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.id, income.id));

			expect(docAfter?.totalAmount).toBe("55.00");
			expect(docAfter?.incomeDate).toEqual(incomeDate);

			const lineItemsAfter = await db
				.select()
				.from(incomeLineItemsTable)
				.where(eq(incomeLineItemsTable.incomeDocumentId, income.id));

			expect(lineItemsAfter).toHaveLength(1);
			expect(lineItemsAfter[0]).toMatchObject({
				title: "Commission",
				quantity: 11,
				singleAmount: "5.00",
			});
		});

		it("throws when income does not belong to the user", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `inc-update-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `inc-update-other-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [otherIncome] = await db
				.insert(incomeDocumentsTable)
				.values({
					userId: otherUser.id,
					totalAmount: "22.00",
					incomeDate: "2026-05-07",
				})
				.returning({ id: incomeDocumentsTable.id });

			if (!otherIncome) {
				throw new Error("Expected seeded income");
			}

			await db.insert(incomeLineItemsTable).values({
				incomeDocumentId: otherIncome.id,
				title: "Item",
				quantity: 1,
				singleAmount: "22.00",
			});

			await expect(
				incomesService.updateIncomeByUserId(owner.id, otherIncome.id, {
					date: decodeDocumentDateFromStorage("2026-05-08"),
					lineItems: [{ title: "X", quantity: 1, singleAmount: 10 }],
				}),
			).rejects.toThrow("Income not found");

			const incomeStillExists = await db
				.select()
				.from(incomeDocumentsTable)
				.where(eq(incomeDocumentsTable.id, otherIncome.id));
			expect(incomeStillExists).toHaveLength(1);

			const lineItemsUnchanged = await db
				.select()
				.from(incomeLineItemsTable)
				.where(eq(incomeLineItemsTable.incomeDocumentId, otherIncome.id));
			expect(lineItemsUnchanged).toHaveLength(1);
			expect(lineItemsUnchanged[0]?.title).toBe("Item");
		});
	});
});
