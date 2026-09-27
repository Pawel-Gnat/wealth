import { Test, type TestingModule } from "@nestjs/testing";
import { ORPCError } from "@orpc/nest";
import { BUDGET_CREATED_MESSAGE } from "@repo/api/schemas";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DBS } from "../database-service/constants";
import {
	budgetMemberTable,
	budgetTable,
} from "../database-service/tables/index";
import { createTestUser } from "../test/mocks/users";
import { TestModule } from "../test/test.module";
import { UsersService } from "../users-service/users.service";
import { BudgetService } from "./budget.service";

describe("Budget service", () => {
	let moduleRef: TestingModule;
	let budgetService: BudgetService;
	let usersService: UsersService;

	beforeAll(async () => {
		moduleRef = await Test.createTestingModule({
			imports: [TestModule],
			providers: [BudgetService],
		}).compile();
		budgetService = moduleRef.get(BudgetService);
		usersService = moduleRef.get(UsersService);
	});

	afterAll(async () => {
		await moduleRef.close();
	});

	describe("list budgets by user id", () => {
		it("returns an empty list when the user has no budgets", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-empty",
			});

			await expect(budgetService.listBudgetsByUserId(user.id)).resolves.toEqual(
				{ data: [] },
			);
		});

		it("lists owned budgets and active memberships, newest first, with members", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `budget-owner-${suffix}@example.com`,
				passwordHash: "hash",
				firstName: "Ola",
				lastName: "Nowak",
			});
			const activeMember = await createTestUser(usersService, {
				email: `budget-active-${suffix}@example.com`,
				passwordHash: "hash",
				firstName: "Bartek",
			});
			const pendingMember = await createTestUser(usersService, {
				email: `budget-pending-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherOwner = await createTestUser(usersService, {
				email: `budget-other-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [olderBudget] = await db
				.insert(budgetTable)
				.values({
					title: "Older household",
					ownerId: owner.id,
					createdAt: new Date("2024-01-15T00:00:00.000Z"),
				})
				.returning({ id: budgetTable.id });

			const [newerBudget] = await db
				.insert(budgetTable)
				.values({
					title: "Newer trip",
					ownerId: owner.id,
					createdAt: new Date("2024-06-01T00:00:00.000Z"),
				})
				.returning({ id: budgetTable.id });

			const [sharedBudget] = await db
				.insert(budgetTable)
				.values({
					title: "Shared office",
					ownerId: otherOwner.id,
					createdAt: new Date("2024-03-01T00:00:00.000Z"),
				})
				.returning({ id: budgetTable.id });

			const [pendingOnlyBudget] = await db
				.insert(budgetTable)
				.values({
					title: "Pending weekend",
					ownerId: otherOwner.id,
				})
				.returning({ id: budgetTable.id });

			if (!olderBudget || !newerBudget || !sharedBudget || !pendingOnlyBudget) {
				throw new Error("Expected seeded budgets");
			}

			await db.insert(budgetMemberTable).values([
				{
					budgetId: newerBudget.id,
					userId: activeMember.id,
					status: "active",
				},
				{
					budgetId: newerBudget.id,
					userId: pendingMember.id,
				},
				{
					budgetId: sharedBudget.id,
					userId: owner.id,
					status: "active",
				},
				{
					budgetId: sharedBudget.id,
					userId: activeMember.id,
					status: "active",
				},
				{
					budgetId: pendingOnlyBudget.id,
					userId: pendingMember.id,
				},
			]);

			const forOwner = await budgetService.listBudgetsByUserId(owner.id);

			expect(forOwner.data).toHaveLength(3);
			expect(forOwner.data.map((budget) => budget.title)).toEqual([
				"Newer trip",
				"Shared office",
				"Older household",
			]);
			expect(forOwner.data[0]).toMatchObject({
				id: newerBudget.id,
				ownerId: owner.id,
			});
			expect(forOwner.data[0]?.members).toEqual(
				expect.arrayContaining([
					{
						id: activeMember.id,
						email: activeMember.email,
						image: null,
						firstName: "Bartek",
						lastName: null,
						status: "active",
					},
					{
						id: pendingMember.id,
						email: pendingMember.email,
						image: null,
						firstName: null,
						lastName: null,
						status: "pending",
					},
				]),
			);
			expect(forOwner.data[0]?.members).toHaveLength(2);
			expect(forOwner.data[2]?.members).toEqual([]);
			expect(
				forOwner.data
					.find((budget) => budget.id === sharedBudget.id)
					?.members.map((member) => member.id),
			).toEqual(expect.arrayContaining([owner.id, activeMember.id]));

			const forPendingMember = await budgetService.listBudgetsByUserId(
				pendingMember.id,
			);
			expect(forPendingMember.data).toEqual([]);

			const forOtherOwner = await budgetService.listBudgetsByUserId(
				otherOwner.id,
			);
			expect(forOtherOwner.data.map((budget) => budget.id)).toEqual(
				expect.arrayContaining([sharedBudget.id, pendingOnlyBudget.id]),
			);
			expect(forOtherOwner.data).toHaveLength(2);
		});
	});

	describe("list invites by user id", () => {
		it("returns an empty list when the user has no pending invites", async () => {
			const user = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-invites-empty",
			});

			await expect(budgetService.listInvitesByUserId(user.id)).resolves.toEqual(
				{
					data: [],
				},
			);
		});

		it("returns incoming pending memberships and outgoing pending invitees", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

			const owner = await createTestUser(usersService, {
				email: `budget-invites-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const activeMember = await createTestUser(usersService, {
				email: `budget-invites-active-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const pendingMember = await createTestUser(usersService, {
				email: `budget-invites-pending-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const otherOwner = await createTestUser(usersService, {
				email: `budget-invites-other-${suffix}@example.com`,
				passwordHash: "hash",
			});

			const [ownedBudget] = await db
				.insert(budgetTable)
				.values({
					title: "Household",
					ownerId: owner.id,
					createdAt: new Date("2024-06-01T00:00:00.000Z"),
				})
				.returning({ id: budgetTable.id });

			const [incomingBudget] = await db
				.insert(budgetTable)
				.values({
					title: "Weekend",
					ownerId: otherOwner.id,
					createdAt: new Date("2024-01-01T00:00:00.000Z"),
				})
				.returning({ id: budgetTable.id });

			if (!ownedBudget || !incomingBudget) {
				throw new Error("Expected seeded budgets");
			}

			await db.insert(budgetMemberTable).values([
				{
					budgetId: ownedBudget.id,
					userId: activeMember.id,
					status: "active",
				},
				{
					budgetId: ownedBudget.id,
					userId: pendingMember.id,
				},
				{
					budgetId: incomingBudget.id,
					userId: owner.id,
				},
			]);

			const forOwner = await budgetService.listInvitesByUserId(owner.id);

			expect(forOwner.data.map((invite) => invite.budget.title)).toEqual([
				"Household",
				"Weekend",
			]);
			expect(forOwner.data[0]).toMatchObject({
				budget: { id: ownedBudget.id, ownerId: owner.id },
				invitee: { id: pendingMember.id, status: "pending" },
			});
			expect(
				forOwner.data[0]?.budget.members.map((member) => member.id),
			).toEqual(expect.arrayContaining([activeMember.id, pendingMember.id]));
			expect(forOwner.data[1]).toMatchObject({
				budget: { id: incomingBudget.id, ownerId: otherOwner.id },
				invitee: { id: owner.id, status: "pending" },
			});

			const forPendingMember = await budgetService.listInvitesByUserId(
				pendingMember.id,
			);
			expect(forPendingMember.data).toHaveLength(1);
			expect(forPendingMember.data[0]).toMatchObject({
				budget: { id: ownedBudget.id },
				invitee: { id: pendingMember.id, status: "pending" },
			});

			const forActiveMember = await budgetService.listInvitesByUserId(
				activeMember.id,
			);
			expect(forActiveMember.data).toEqual([]);
		});
	});

	describe("create budget by user id", () => {
		it("creates a budget without members", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-create-empty",
			});

			await expect(
				budgetService.createBudgetByUserId(owner.id, {
					title: "Solo budget",
					memberIds: [],
				}),
			).resolves.toEqual({
				data: { message: BUDGET_CREATED_MESSAGE },
			});

			const createdBudgets = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.ownerId, owner.id));

			expect(createdBudgets).toHaveLength(1);
			expect(createdBudgets[0]).toMatchObject({
				title: "Solo budget",
				ownerId: owner.id,
			});

			const createdBudget = createdBudgets[0];
			if (!createdBudget) {
				throw new Error("Expected created budget");
			}

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, createdBudget.id));

			expect(members).toHaveLength(0);
		});

		it("stores invitees as pending and skips the owner id", async () => {
			const db = moduleRef.get(DBS.APP);
			const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
			const owner = await createTestUser(usersService, {
				email: `budget-create-owner-${suffix}@example.com`,
				passwordHash: "hash",
			});
			const invitee = await createTestUser(usersService, {
				email: `budget-create-invitee-${suffix}@example.com`,
				passwordHash: "hash",
			});

			await budgetService.createBudgetByUserId(owner.id, {
				title: "Household",
				memberIds: [invitee.id, owner.id],
			});

			const [createdBudget] = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.ownerId, owner.id));

			if (!createdBudget) {
				throw new Error("Expected created budget");
			}

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, createdBudget.id));

			expect(members).toEqual([
				expect.objectContaining({
					budgetId: createdBudget.id,
					userId: invitee.id,
					status: "pending",
				}),
			]);
		});

		it("exposes the newly created budget in the user list", async () => {
			const owner = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-create-list",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-create-list-invitee",
			});

			await budgetService.createBudgetByUserId(owner.id, {
				title: "Trip",
				memberIds: [invitee.id],
			});

			const result = await budgetService.listBudgetsByUserId(owner.id);

			expect(result.data).toHaveLength(1);
			expect(result.data[0]).toMatchObject({
				title: "Trip",
				ownerId: owner.id,
				members: [
					expect.objectContaining({
						id: invitee.id,
						status: "pending",
					}),
				],
			});
		});

		it("throws when the owner does not exist and does not persist a budget", async () => {
			const db = moduleRef.get(DBS.APP);
			const missingUserId = "01K1MISSINGUSER000000000000";

			const before = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.ownerId, missingUserId));

			await expect(
				budgetService.createBudgetByUserId(missingUserId, {
					title: "Missing owner",
					memberIds: [],
				}),
			).rejects.toThrow();

			const after = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.ownerId, missingUserId));

			expect(before).toHaveLength(0);
			expect(after).toHaveLength(0);
		});

		it("does not persist a budget when an invitee does not exist", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-create-missing-invitee",
			});
			const missingInviteeId = "01K1MISSINGINVITEE0000000000";

			await expect(
				budgetService.createBudgetByUserId(owner.id, {
					title: "Broken invite",
					memberIds: [missingInviteeId],
				}),
			).rejects.toBeInstanceOf(ORPCError);

			const createdBudgets = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.ownerId, owner.id));

			expect(createdBudgets).toHaveLength(0);
		});
	});
});
