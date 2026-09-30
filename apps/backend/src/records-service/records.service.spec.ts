import type { TestingModule } from "@nestjs/testing";
import { ORPCError } from "@orpc/nest";
import {
	RECORD_CREATED_MESSAGE,
	RECORD_DELETED_MESSAGE,
	RECORD_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import type { RecordKind } from "@repo/api/types";
import { decodeDocumentDateFromStorage } from "@repo/common/helpers";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DBS } from "../database-service/constants";
import {
	budgetMemberTable,
	budgetTable,
	recordLineItemsTable,
	recordsTable,
} from "../database-service/tables/index";
import { createTestApp } from "../test/helpers/modules";
import { createTestUser } from "../test/mocks/users";
import { UsersService } from "../users-service/users.service";
import { RecordsService } from "./records.service";

const documentMessages = {
	expense: {
		created: RECORD_CREATED_MESSAGE,
		updated: RECORD_UPDATED_MESSAGE,
		deleted: RECORD_DELETED_MESSAGE,
		notFound: "Expense not found",
	},
	income: {
		created: RECORD_CREATED_MESSAGE,
		updated: RECORD_UPDATED_MESSAGE,
		deleted: RECORD_DELETED_MESSAGE,
		notFound: "Income not found",
	},
} as const;

const otherKind = (kind: RecordKind): RecordKind =>
	kind === "expense" ? "income" : "expense";

describe("Records service", () => {
	let moduleRef: TestingModule;
	let recordsService: RecordsService;
	let usersService: UsersService;

	beforeAll(async () => {
		moduleRef = await createTestApp([RecordsService]).compile();
		recordsService = moduleRef.get(RecordsService);
		usersService = moduleRef.get(UsersService);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	describe.each([
		"expense",
		"income",
	] as const)("personal %s documents", (kind) => {
		const messages = documentMessages[kind];

		it("returns an empty list when the user has no documents of that kind", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-empty`,
			});

			await expect(recordsService.listByUserId(user.id, kind)).resolves.toEqual(
				{ data: [], pagination: {} },
			);
		});

		it("lists only personal documents of that kind, newest date first", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const userA = await createTestUser(usersService, {
				email: `docs-a-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const userB = await createTestUser(usersService, {
				email: `docs-b-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Group", ownerId: userA.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(recordsTable).values([
				{
					userId: userA.id,
					kind,
					budgetId: null,
					totalAmount: "100",
					documentDate: "2024-01-15",
				},
				{
					userId: userA.id,
					kind,
					budgetId: null,
					totalAmount: "50.50",
					documentDate: "2024-06-01",
				},
				{
					userId: userA.id,
					kind: otherKind(kind),
					budgetId: null,
					totalAmount: "8",
					documentDate: "2024-12-01",
				},
				{
					userId: userA.id,
					kind,
					budgetId: budget.id,
					totalAmount: "77",
					documentDate: "2024-08-01",
				},
				{
					userId: userB.id,
					kind,
					budgetId: null,
					totalAmount: "9.99",
					documentDate: "2024-03-01",
				},
			]);

			const forA = await recordsService.listByUserId(userA.id, kind);

			expect(forA.pagination).toEqual({});
			expect(forA.data).toHaveLength(2);
			expect(forA.data[0]).toMatchObject({
				kind,
				totalAmount: 50.5,
				date: decodeDocumentDateFromStorage("2024-06-01"),
			});
			expect(forA.data[1]).toMatchObject({
				totalAmount: 100,
				date: decodeDocumentDateFromStorage("2024-01-15"),
			});

			const forB = await recordsService.listByUserId(userB.id, kind);
			expect(forB.data).toHaveLength(1);
		});

		it("creates a personal document with computed total and line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-create`,
			});
			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-01"),
				lineItems: [
					{ title: "Taxi", quantity: 2, singleAmount: 12.5 },
					{ title: "Lunch", quantity: 1, singleAmount: 30 },
				],
			};

			await expect(
				recordsService.createByUserId(user.id, kind, payload),
			).resolves.toEqual({
				data: { message: messages.created },
			});

			const [createdDocument] = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.userId, user.id));

			expect(createdDocument).toMatchObject({
				kind,
				budgetId: null,
				totalAmount: "55.00",
				documentDate: "2026-05-01",
			});

			if (!createdDocument) {
				throw new Error("Expected created document");
			}

			const createdLineItems = await db
				.select()
				.from(recordLineItemsTable)
				.where(eq(recordLineItemsTable.documentId, createdDocument.id));

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

		it("returns the created document from the personal list", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-create-list`,
			});
			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-02"),
				lineItems: [{ title: "Coffee", quantity: 3, singleAmount: 4 }],
			};

			await recordsService.createByUserId(user.id, kind, payload);
			const result = await recordsService.listByUserId(user.id, kind);

			expect(result.data).toHaveLength(1);
			expect(result.data[0]).toMatchObject({
				date: payload.date,
				totalAmount: 12,
			});
		});

		it("does not persist a document when the user does not exist", async () => {
			const db = moduleRef.get(DBS.APP);
			const missingUserId = "01K1MISSINGUSER000000000000";
			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-03"),
				lineItems: [{ title: "Train", quantity: 1, singleAmount: 15 }],
			};

			await expect(
				recordsService.createByUserId(missingUserId, kind, payload),
			).rejects.toThrow();

			const rows = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.userId, missingUserId));

			expect(rows).toHaveLength(0);
		});

		it("returns document details for the owner", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-get`,
			});
			const payload = {
				date: decodeDocumentDateFromStorage("2026-05-04"),
				lineItems: [{ title: "Ticket", quantity: 1, singleAmount: 18 }],
			};

			await recordsService.createByUserId(user.id, kind, payload);
			const listed = await recordsService.listByUserId(user.id, kind);
			const documentId = listed.data[0]?.id;

			if (!documentId) {
				throw new Error("Expected listed document");
			}

			const details = await recordsService.getByUserId(user.id, documentId);

			expect(details.data).toMatchObject({
				id: documentId,
				kind,
				date: payload.date,
				totalAmount: 18,
			});
			expect(details.data.lineItems).toEqual([
				expect.objectContaining({
					title: "Ticket",
					quantity: 1,
					singleAmount: 18,
				}),
			]);
		});

		it("deletes only the owner's personal document and its line items", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
			const owner = await createTestUser(usersService, {
				email: `delete-owner-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherUser = await createTestUser(usersService, {
				email: `delete-other-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [ownerDocument] = await db
				.insert(recordsTable)
				.values({
					userId: owner.id,
					kind,
					budgetId: null,
					totalAmount: "20.00",
					documentDate: "2026-05-04",
				})
				.returning({ id: recordsTable.id });

			const [otherDocument] = await db
				.insert(recordsTable)
				.values({
					userId: otherUser.id,
					kind,
					budgetId: null,
					totalAmount: "30.00",
					documentDate: "2026-05-05",
				})
				.returning({ id: recordsTable.id });

			if (!ownerDocument || !otherDocument) {
				throw new Error("Expected seeded documents");
			}

			await db.insert(recordLineItemsTable).values({
				documentId: ownerDocument.id,
				title: "Line item to delete",
				quantity: 1,
				singleAmount: "20.00",
			});

			await expect(
				recordsService.deleteByUserId(owner.id, ownerDocument.id, kind),
			).resolves.toEqual({
				data: { message: messages.deleted },
			});

			const ownerAfterDelete = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.id, ownerDocument.id));

			const lineItemsAfterDelete = await db
				.select()
				.from(recordLineItemsTable)
				.where(eq(recordLineItemsTable.documentId, ownerDocument.id));

			const otherAfterDelete = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.id, otherDocument.id));

			expect(ownerAfterDelete).toHaveLength(0);
			expect(lineItemsAfterDelete).toHaveLength(0);
			expect(otherAfterDelete).toHaveLength(1);
		});

		it("throws when the document belongs to another user", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `delete-scope-owner-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const otherUser = await createTestUser(usersService, {
				email: `delete-scope-other-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [otherDocument] = await db
				.insert(recordsTable)
				.values({
					userId: otherUser.id,
					kind,
					budgetId: null,
					totalAmount: "44.00",
					documentDate: "2026-05-06",
				})
				.returning({ id: recordsTable.id });

			if (!otherDocument) {
				throw new Error("Expected seeded document");
			}

			await expect(
				recordsService.deleteByUserId(owner.id, otherDocument.id, kind),
			).rejects.toThrow(messages.notFound);
		});

		it("updates the date, total, and replaces line items", async () => {
			const db = moduleRef.get(DBS.APP);

			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-update`,
			});

			const [document] = await db
				.insert(recordsTable)
				.values({
					userId: user.id,
					kind,
					budgetId: null,
					totalAmount: "20.00",
					documentDate: "2024-01-01",
				})
				.returning({ id: recordsTable.id });

			if (!document) {
				throw new Error("Expected seeded document");
			}

			await db.insert(recordLineItemsTable).values({
				documentId: document.id,
				title: "Old item",
				quantity: 1,
				singleAmount: "20.00",
			});

			const payload = {
				date: decodeDocumentDateFromStorage("2025-06-15"),
				lineItems: [{ title: "Train", quantity: 2, singleAmount: 15 }],
			};

			await expect(
				recordsService.updateByUserId(user.id, document.id, kind, payload),
			).resolves.toEqual({
				data: { message: messages.updated },
			});

			const [documentAfter] = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.id, document.id));

			const lineItemsAfter = await db
				.select()
				.from(recordLineItemsTable)
				.where(eq(recordLineItemsTable.documentId, document.id));

			expect(documentAfter).toMatchObject({
				totalAmount: "30.00",
				documentDate: "2025-06-15",
			});
			expect(lineItemsAfter).toEqual([
				expect.objectContaining({
					title: "Train",
					quantity: 2,
					singleAmount: "15.00",
				}),
			]);
		});

		it("keeps date and total when they are unchanged and still replaces line items", async () => {
			const db = moduleRef.get(DBS.APP);

			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-update-skip`,
			});
			const documentDate = "2026-05-10";

			const [document] = await db
				.insert(recordsTable)
				.values({
					userId: user.id,
					kind,
					budgetId: null,
					totalAmount: "55.00",
					documentDate,
				})
				.returning({ id: recordsTable.id });

			if (!document) {
				throw new Error("Expected seeded document");
			}

			await db.insert(recordLineItemsTable).values({
				documentId: document.id,
				title: "Taxi",
				quantity: 2,
				singleAmount: "12.50",
			});

			await recordsService.updateByUserId(user.id, document.id, kind, {
				date: decodeDocumentDateFromStorage(documentDate),
				lineItems: [{ title: "Coffee", quantity: 11, singleAmount: 5 }],
			});

			const [documentAfter] = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.id, document.id));

			const lineItemsAfter = await db
				.select()
				.from(recordLineItemsTable)
				.where(eq(recordLineItemsTable.documentId, document.id));

			expect(documentAfter).toMatchObject({
				totalAmount: "55.00",
				documentDate,
			});
			expect(lineItemsAfter).toEqual([
				expect.objectContaining({
					title: "Coffee",
					quantity: 11,
					singleAmount: "5.00",
				}),
			]);
		});

		it("does not update a document that belongs to another user", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `update-owner-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const otherUser = await createTestUser(usersService, {
				email: `update-other-${kind}-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [otherDocument] = await db
				.insert(recordsTable)
				.values({
					userId: otherUser.id,
					kind,
					budgetId: null,
					totalAmount: "22.00",
					documentDate: "2026-05-07",
				})
				.returning({ id: recordsTable.id });

			if (!otherDocument) {
				throw new Error("Expected seeded document");
			}

			await db.insert(recordLineItemsTable).values({
				documentId: otherDocument.id,
				title: "Item",
				quantity: 1,
				singleAmount: "22.00",
			});

			await expect(
				recordsService.updateByUserId(owner.id, otherDocument.id, kind, {
					date: decodeDocumentDateFromStorage("2026-05-08"),
					lineItems: [{ title: "X", quantity: 1, singleAmount: 10 }],
				}),
			).rejects.toThrow(messages.notFound);

			const lineItems = await db
				.select()
				.from(recordLineItemsTable)
				.where(eq(recordLineItemsTable.documentId, otherDocument.id));

			expect(lineItems).toHaveLength(1);
			expect(lineItems[0]?.title).toBe("Item");
		});

		it("does not update a group document through the personal endpoint", async () => {
			const db = moduleRef.get(DBS.APP);

			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: `${kind}-group-update`,
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: user.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			const [groupDocument] = await db
				.insert(recordsTable)
				.values({
					userId: user.id,
					kind,
					budgetId: budget.id,
					totalAmount: "40.00",
					documentDate: "2026-05-09",
				})
				.returning({ id: recordsTable.id });

			if (!groupDocument) {
				throw new Error("Expected seeded document");
			}

			await db.insert(recordLineItemsTable).values({
				documentId: groupDocument.id,
				title: "Rent",
				quantity: 1,
				singleAmount: "40.00",
			});

			await expect(
				recordsService.updateByUserId(user.id, groupDocument.id, kind, {
					date: decodeDocumentDateFromStorage("2026-05-11"),
					lineItems: [{ title: "Changed", quantity: 1, singleAmount: 1 }],
				}),
			).rejects.toThrow(messages.notFound);

			const [documentAfter] = await db
				.select()
				.from(recordsTable)
				.where(eq(recordsTable.id, groupDocument.id));

			expect(documentAfter).toMatchObject({
				totalAmount: "40.00",
				documentDate: "2026-05-09",
				budgetId: budget.id,
			});
		});
	});

	describe("listByUserId budget scope", () => {
		it("returns group records for the budget and skips personal ones", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `list-budget-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared list", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			const [otherBudget] = await db
				.insert(budgetTable)
				.values({ title: "Other", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget || !otherBudget) {
				throw new Error("Expected seeded budgets");
			}

			await db.insert(recordsTable).values([
				{
					userId: owner.id,
					kind: "expense",
					budgetId: null,
					totalAmount: "5.00",
					documentDate: "2026-01-01",
				},
				{
					userId: owner.id,
					kind: "income",
					budgetId: budget.id,
					totalAmount: "25.50",
					documentDate: "2026-04-01",
				},
				{
					userId: owner.id,
					kind: "expense",
					budgetId: budget.id,
					totalAmount: "10.00",
					documentDate: "2026-02-01",
				},
				{
					userId: owner.id,
					kind: "expense",
					budgetId: otherBudget.id,
					totalAmount: "99.00",
					documentDate: "2026-06-01",
				},
			]);

			const listed = await recordsService.listByUserId(
				owner.id,
				undefined,
				budget.id,
			);

			expect(listed.data).toHaveLength(2);
			expect(listed.data[0]).toMatchObject({
				kind: "income",
				totalAmount: 25.5,
			});
			expect(listed.data[1]).toMatchObject({
				kind: "expense",
				totalAmount: 10,
			});
		});
	});

	describe("list by budget id", () => {
		it("returns group documents for the owner and an active member, newest first", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `budget-docs-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const activeMember = await createTestUser(usersService, {
				email: `budget-docs-active-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Household", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: activeMember.id,
				status: "active",
			});

			await db.insert(recordsTable).values([
				{
					userId: owner.id,
					kind: "expense",
					budgetId: budget.id,
					totalAmount: "10.00",
					documentDate: "2026-01-01",
				},
				{
					userId: activeMember.id,
					kind: "income",
					budgetId: budget.id,
					totalAmount: "25.50",
					documentDate: "2026-04-01",
				},
				{
					userId: owner.id,
					kind: "expense",
					budgetId: null,
					totalAmount: "99.00",
					documentDate: "2026-06-01",
				},
			]);

			const forOwner = await recordsService.listByBudgetId(owner.id, budget.id);
			const forMember = await recordsService.listByBudgetId(
				activeMember.id,
				budget.id,
			);

			expect(forOwner.data).toEqual(forMember.data);
			expect(forOwner.data).toHaveLength(2);
			expect(forOwner.data[0]).toMatchObject({
				kind: "income",
				totalAmount: 25.5,
				date: decodeDocumentDateFromStorage("2026-04-01"),
			});
			expect(forOwner.data[1]).toMatchObject({
				kind: "expense",
				totalAmount: 10,
				date: decodeDocumentDateFromStorage("2026-01-01"),
			});
		});

		it("filters group documents by kind", async () => {
			const db = moduleRef.get(DBS.APP);

			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-docs-kind",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Filter", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(recordsTable).values([
				{
					userId: owner.id,
					kind: "expense",
					budgetId: budget.id,
					totalAmount: "10.00",
					documentDate: "2026-02-01",
				},
				{
					userId: owner.id,
					kind: "income",
					budgetId: budget.id,
					totalAmount: "20.00",
					documentDate: "2026-03-01",
				},
			]);

			const expenses = await recordsService.listByBudgetId(
				owner.id,
				budget.id,
				"expense",
			);

			expect(expenses.data).toHaveLength(1);
			expect(expenses.data[0]).toMatchObject({
				kind: "expense",
				totalAmount: 10,
			});
		});

		it("hides the budget from a pending member and from a stranger", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `budget-docs-hidden-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const pendingMember = await createTestUser(usersService, {
				email: `budget-docs-pending-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const stranger = await createTestUser(usersService, {
				email: `budget-docs-stranger-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Private", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: pendingMember.id,
				status: "pending",
			});

			await expect(
				recordsService.listByBudgetId(pendingMember.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				recordsService.listByBudgetId(stranger.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				recordsService.listByBudgetId(owner.id, "01K1MISSINGBUDGET00000000000"),
			).rejects.toBeInstanceOf(ORPCError);
		});
	});
});
