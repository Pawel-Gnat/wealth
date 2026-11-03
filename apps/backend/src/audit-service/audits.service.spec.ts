import type { TestingModule } from "@nestjs/testing";
import { AUTH_EVENTS, BUDGET_EVENTS, RECORD_EVENTS } from "@repo/api/events";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DBS } from "../database-service/constants";
import {
	budgetMemberTable,
	budgetTable,
} from "../database-service/tables/index";
import { createTestApp } from "../test/helpers/modules";
import { createTestUser } from "../test/mocks/users";
import { UsersService } from "../users-service/users.service";
import { AuditsService } from "./audits.service";

describe("Audits service", () => {
	let moduleRef: TestingModule;
	let auditsService: AuditsService;
	let usersService: UsersService;
	let db: NodePgDatabase;

	beforeAll(async () => {
		moduleRef = await createTestApp([AuditsService]).compile();
		auditsService = moduleRef.get(AuditsService);
		usersService = moduleRef.get(UsersService);
		db = moduleRef.get(DBS.APP);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	it("rolls the audit back when the caller transaction fails", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-rollback",
		});

		await expect(
			db.transaction(async (tx) => {
				await auditsService.createUserAudit(tx, {
					userId: user.id,
					entityId: user.id,
					event: AUTH_EVENTS.signedIn,
					metadata: {},
				});
				throw new Error("caller failed");
			}),
		).rejects.toThrow("caller failed");

		await expect(
			auditsService.list(user.id, { actions: [AUTH_EVENTS.signedIn] }),
		).resolves.toEqual({ data: [] });
	});

	it("returns the signed-in user's account audits, newest first", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-account",
		});
		const other = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-account-other",
		});

		await db.transaction(async (tx) => {
			await auditsService.createUserAudit(tx, {
				userId: user.id,
				entityId: user.id,
				event: AUTH_EVENTS.signedIn,
				metadata: {},
			});
		});

		await db.transaction(async (tx) => {
			await auditsService.createUserAudit(tx, {
				userId: user.id,
				entityId: user.id,
				event: AUTH_EVENTS.passwordUpdated,
				metadata: {},
			});

			await auditsService.createUserAudit(tx, {
				userId: other.id,
				entityId: other.id,
				event: AUTH_EVENTS.signedIn,
				metadata: {},
			});
		});

		const listed = await auditsService.list(user.id, {
			actions: [AUTH_EVENTS.signedIn, AUTH_EVENTS.passwordUpdated],
		});

		expect(listed.data.map((audit) => audit.event)).toEqual([
			AUTH_EVENTS.passwordUpdated,
			AUTH_EVENTS.signedIn,
		]);
		expect(listed.data[0]).toMatchObject({
			actorId: user.id,
			entityId: user.id,
			metadata: {},
		});
	});

	it("limits personal record audits to the requested record", async () => {
		const user = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-record",
		});

		await db.transaction(async (tx) => {
			await auditsService.createUserAudit(tx, {
				userId: user.id,
				entityId: "record-1",
				event: RECORD_EVENTS.expense.created,
				metadata: {
					recordId: "record-1",
					date: "2026-10-01",
					lineItems: [{ title: "Rent", quantity: 1, singleAmount: 10 }],
				},
			});

			await auditsService.createUserAudit(tx, {
				userId: user.id,
				entityId: "record-2",
				event: RECORD_EVENTS.expense.created,
				metadata: {
					recordId: "record-2",
					date: "2026-10-02",
					lineItems: [{ title: "Food", quantity: 1, singleAmount: 5 }],
				},
			});
		});

		const listed = await auditsService.list(user.id, {
			actions: [RECORD_EVENTS.expense.created],
			entityId: "record-1",
		});

		expect(listed.data).toHaveLength(1);
		expect(listed.data[0]).toMatchObject({ entityId: "record-1" });
	});

	it("returns budget audits to the owner and an active member", async () => {
		const owner = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-budget-owner",
		});
		const member = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-budget-member",
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
			userId: member.id,
			status: "active",
		});

		await db.transaction(async (tx) => {
			await auditsService.createBudgetAudit(tx, {
				budgetId: budget.id,
				actorUserId: owner.id,
				entityId: budget.id,
				event: BUDGET_EVENTS.created,
				metadata: { title: "Household" },
			});
		});

		const params = {
			actions: [BUDGET_EVENTS.created],
			entityId: budget.id,
		};
		const forOwner = await auditsService.list(owner.id, params);
		const forMember = await auditsService.list(member.id, params);

		expect(forOwner.data).toHaveLength(1);
		expect(forMember.data).toEqual(forOwner.data);
		expect(forOwner.data[0]).toMatchObject({
			actorId: owner.id,
			entityId: budget.id,
			metadata: { title: "Household" },
		});
	});

	it("returns one budget record audit and keeps it off the personal list", async () => {
		const owner = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-budget-record-owner",
		});

		const [budget] = await db
			.insert(budgetTable)
			.values({ title: "Household", ownerId: owner.id })
			.returning({ id: budgetTable.id });
		if (!budget) {
			throw new Error("Expected seeded budget");
		}

		const lineItems = [{ title: "Rent", quantity: 1, singleAmount: 10 }];

		await db.transaction(async (tx) => {
			await auditsService.createBudgetAudit(tx, {
				budgetId: budget.id,
				actorUserId: owner.id,
				entityId: "record-1",
				event: RECORD_EVENTS.expense.created,
				metadata: { recordId: "record-1", date: "2026-10-01", lineItems },
			});

			await auditsService.createBudgetAudit(tx, {
				budgetId: budget.id,
				actorUserId: owner.id,
				entityId: "record-2",
				event: RECORD_EVENTS.expense.created,
				metadata: { recordId: "record-2", date: "2026-10-02", lineItems },
			});
		});

		const listed = await auditsService.list(owner.id, {
			actions: [RECORD_EVENTS.expense.created],
			entityId: "record-1",
			budgetId: budget.id,
		});
		const personal = await auditsService.list(owner.id, {
			actions: [RECORD_EVENTS.expense.created],
			entityId: "record-1",
		});

		expect(listed.data).toHaveLength(1);
		expect(listed.data[0]).toMatchObject({ entityId: "record-1" });
		expect(personal.data).toEqual([]);
	});

	it("hides budget audits from someone without access", async () => {
		const owner = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-budget-hidden-owner",
		});
		const pending = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-budget-pending",
		});
		const stranger = await createTestUser(usersService, {
			passwordHash: "hash",
			emailTag: "audit-budget-stranger",
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
			userId: pending.id,
			status: "pending",
		});

		const params = {
			actions: [BUDGET_EVENTS.created],
			entityId: budget.id,
		};

		await expect(auditsService.list(pending.id, params)).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		await expect(auditsService.list(stranger.id, params)).rejects.toMatchObject(
			{
				code: "NOT_FOUND",
			},
		);
		await expect(
			auditsService.list(pending.id, {
				actions: [RECORD_EVENTS.expense.created],
				entityId: "record-1",
				budgetId: budget.id,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		await expect(
			auditsService.list(owner.id, {
				actions: [BUDGET_EVENTS.created],
				entityId: "missing-budget",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
