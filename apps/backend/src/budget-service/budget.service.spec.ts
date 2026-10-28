import type { TestingModule } from "@nestjs/testing";
import { ORPCError } from "@orpc/nest";
import { BUDGET_EVENTS } from "@repo/api/events";
import {
	BUDGET_CREATED_MESSAGE,
	BUDGET_DELETED_MESSAGE,
	BUDGET_INVITE_ACCEPTED_MESSAGE,
	BUDGET_INVITE_CANCELLED_MESSAGE,
	BUDGET_INVITE_REJECTED_MESSAGE,
	BUDGET_LEFT_MESSAGE,
	BUDGET_MEMBER_IDS_MAX,
	BUDGET_MEMBERS_INVITED_MESSAGE,
	BUDGET_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { logger } from "@repo/observability/node";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AuditsService } from "../audits-service/audits.service";
import { DBS } from "../database-service/constants";
import {
	budgetAuditsTable,
	budgetMemberTable,
	budgetTable,
	recordLineItemsTable,
	recordsTable,
	storageTable,
} from "../database-service/tables/index";
import { StorageService } from "../storage-service/storage.service";
import { createTestApp } from "../test/helpers/modules";
import { createTestUser } from "../test/mocks/users";
import { UsersService } from "../users-service/users.service";
import { BudgetService } from "./budget.service";

describe("Budget service", () => {
	let moduleRef: TestingModule;
	let budgetService: BudgetService;
	let usersService: UsersService;
	let storageService: StorageService;

	beforeAll(async () => {
		moduleRef = await createTestApp([BudgetService, AuditsService]).compile();
		budgetService = moduleRef.get(BudgetService);
		usersService = moduleRef.get(UsersService);
		storageService = moduleRef.get(StorageService);
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
				owner: { id: owner.id },
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
				budget: { id: ownedBudget.id, owner: { id: owner.id } },
				invitee: { id: pendingMember.id, status: "pending" },
			});
			expect(
				forOwner.data[0]?.budget.members.map((member) => member.id),
			).toEqual(expect.arrayContaining([activeMember.id, pendingMember.id]));
			expect(forOwner.data[1]).toMatchObject({
				budget: { id: incomingBudget.id, owner: { id: otherOwner.id } },
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

			const audits = await db
				.select()
				.from(budgetAuditsTable)
				.where(eq(budgetAuditsTable.budgetId, createdBudget.id));

			expect(audits).toEqual([
				expect.objectContaining({
					actorUserId: owner.id,
					entityId: createdBudget.id,
					event: BUDGET_EVENTS.created,
					metadata: { title: "Solo budget" },
				}),
			]);
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

			const audits = await db
				.select({
					event: budgetAuditsTable.event,
					metadata: budgetAuditsTable.metadata,
				})
				.from(budgetAuditsTable)
				.where(eq(budgetAuditsTable.budgetId, createdBudget.id));

			expect(audits).toHaveLength(2);
			expect(audits).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						event: BUDGET_EVENTS.created,
						metadata: { title: "Household" },
					}),
					expect.objectContaining({
						event: BUDGET_EVENTS.memberInvited,
						metadata: { userId: invitee.id },
					}),
				]),
			);
		});

		it("exposes the newly created budget in the user list", async () => {
			const db = moduleRef.get(DBS.APP);
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

			const [stored] = await db
				.insert(storageTable)
				.values({ objectKey: `avatars/${owner.id}/avatar.jpg` })
				.returning({ id: storageTable.id });

			if (!stored) {
				throw new Error("storage insert failed");
			}

			await usersService.updateImage(owner.id, stored.id);
			const image = `http://localhost:9000/wealth-storage/avatars/${owner.id}/avatar.jpg`;
			vi.mocked(storageService.resolvePublicUrl).mockResolvedValue(
				new Map([[stored.id, image]]),
			);

			const result = await budgetService.listBudgetsByUserId(owner.id);

			expect(result.data).toHaveLength(1);
			expect(result.data[0]).toMatchObject({
				title: "Trip",
				owner: {
					id: owner.id,
					email: owner.email,
					image,
					firstName: owner.firstName,
					lastName: owner.lastName,
				},
				members: [
					expect.objectContaining({
						id: invitee.id,
						status: "pending",
					}),
				],
			});
		});

		it("rejects a member list above the maximum and does not persist a budget", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hashed-password",
				emailTag: "budget-create-too-many",
			});

			await expect(
				budgetService.createBudgetByUserId(owner.id, {
					title: "Too many",
					memberIds: Array.from(
						{ length: BUDGET_MEMBER_IDS_MAX + 1 },
						(_, index) => `01K1MEMBER${String(index).padStart(16, "0")}`,
					),
				}),
			).rejects.toThrow(ORPCError);

			const createdBudgets = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.ownerId, owner.id));

			expect(createdBudgets).toHaveLength(0);
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

	describe("update budget by user id", () => {
		it("updates the title for the owner", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-update-owner",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Old title", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await expect(
				budgetService.updateBudgetByUserId(owner.id, {
					id: budget.id,
					title: "New title",
				}),
			).resolves.toEqual({
				data: { message: BUDGET_UPDATED_MESSAGE },
			});

			const [stored] = await db
				.select({ title: budgetTable.title })
				.from(budgetTable)
				.where(eq(budgetTable.id, budget.id));

			expect(stored?.title).toBe("New title");

			const audits = await db
				.select()
				.from(budgetAuditsTable)
				.where(eq(budgetAuditsTable.budgetId, budget.id));
			expect(audits).toEqual([
				expect.objectContaining({
					event: BUDGET_EVENTS.updated,
					metadata: {
						oldValues: { title: "Old title" },
						newValues: { title: "New title" },
					},
				}),
			]);
		});

		it("does not write an audit when the title stays the same", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-update-same",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Same title", ownerId: owner.id })
				.returning({ id: budgetTable.id });
			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await budgetService.updateBudgetByUserId(owner.id, {
				id: budget.id,
				title: "Same title",
			});

			const audits = await db
				.select()
				.from(budgetAuditsTable)
				.where(eq(budgetAuditsTable.budgetId, budget.id));

			expect(audits).toEqual([]);
		});

		it("rejects a member and a missing budget", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-update-denied-owner",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-update-denied-member",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Kept title", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: member.id,
				status: "active",
			});

			await expect(
				budgetService.updateBudgetByUserId(member.id, {
					id: budget.id,
					title: "Stolen title",
				}),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				budgetService.updateBudgetByUserId(owner.id, {
					id: "01K1MISSINGBUDGET00000000000",
					title: "Missing",
				}),
			).rejects.toBeInstanceOf(ORPCError);

			const [stored] = await db
				.select({ title: budgetTable.title })
				.from(budgetTable)
				.where(eq(budgetTable.id, budget.id));

			expect(stored?.title).toBe("Kept title");
		});
	});

	describe("invite members by user id", () => {
		it("stores new invitees as pending and skips the owner and existing members", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-owner",
			});
			const activeMember = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-active",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-new",
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

			await expect(
				budgetService.inviteMembersByUserId(owner.id, {
					id: budget.id,
					memberIds: [owner.id, activeMember.id, invitee.id],
				}),
			).resolves.toEqual({
				data: { message: BUDGET_MEMBERS_INVITED_MESSAGE },
			});

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toHaveLength(2);
			expect(members).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						userId: activeMember.id,
						status: "active",
					}),
					expect.objectContaining({
						userId: invitee.id,
						status: "pending",
					}),
				]),
			);
		});

		it("does not insert anyone when an invitee does not exist", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-missing-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-missing-real",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Household", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await expect(
				budgetService.inviteMembersByUserId(owner.id, {
					id: budget.id,
					memberIds: [invitee.id, "01K1MISSINGINVITEE0000000000"],
				}),
			).rejects.toBeInstanceOf(ORPCError);

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toHaveLength(0);
		});

		it("rejects when existing members plus new invitees exceed the maximum", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-limit-owner",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Full", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			const members = await Promise.all(
				Array.from({ length: BUDGET_MEMBER_IDS_MAX }, (_, index) =>
					createTestUser(usersService, {
						passwordHash: "hash",
						emailTag: `budget-invite-limit-${index}`,
					}),
				),
			);

			await db.insert(budgetMemberTable).values(
				members.map((member) => ({
					budgetId: budget.id,
					userId: member.id,
					status: "active" as const,
				})),
			);

			const extra = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-limit-extra",
			});

			await expect(
				budgetService.inviteMembersByUserId(owner.id, {
					id: budget.id,
					memberIds: [extra.id],
				}),
			).rejects.toBeInstanceOf(ORPCError);

			const stored = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(stored).toHaveLength(BUDGET_MEMBER_IDS_MAX);
		});

		it("rejects a member", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-denied-owner",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-denied-member",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-invite-denied-invitee",
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

			await expect(
				budgetService.inviteMembersByUserId(member.id, {
					id: budget.id,
					memberIds: [invitee.id],
				}),
			).rejects.toBeInstanceOf(ORPCError);

			const stored = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(stored).toHaveLength(1);
		});
	});

	describe("delete budget by user id", () => {
		it("deletes the budget together with its members and records", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-delete-owner",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-delete-member",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "To delete", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: member.id,
				status: "active",
			});

			const [record] = await db
				.insert(recordsTable)
				.values({
					userId: owner.id,
					budgetId: budget.id,
					kind: "expense",
					totalAmount: "12.00",
					documentDate: "2024-04-01",
				})
				.returning({ id: recordsTable.id });

			if (!record) {
				throw new Error("Expected seeded record");
			}

			await db.insert(recordLineItemsTable).values({
				documentId: record.id,
				title: "Lunch",
				quantity: 1,
				singleAmount: "12.00",
			});

			const info = vi.spyOn(logger, "info");

			await expect(
				budgetService.deleteBudgetByUserId(owner.id, budget.id),
			).resolves.toEqual({
				data: { message: BUDGET_DELETED_MESSAGE },
			});
			expect(info).toHaveBeenCalledWith(
				BUDGET_EVENTS.deleted,
				expect.objectContaining({
					actorId: owner.id,
					ownerType: "budget",
					ownerId: budget.id,
					subjectType: "budget",
					subjectId: budget.id,
				}),
			);
			info.mockRestore();

			const [budgets, members, records, lineItems] = await Promise.all([
				db.select().from(budgetTable).where(eq(budgetTable.id, budget.id)),
				db
					.select()
					.from(budgetMemberTable)
					.where(eq(budgetMemberTable.budgetId, budget.id)),
				db.select().from(recordsTable).where(eq(recordsTable.id, record.id)),
				db
					.select()
					.from(recordLineItemsTable)
					.where(eq(recordLineItemsTable.documentId, record.id)),
			]);

			expect(budgets).toHaveLength(0);
			expect(members).toHaveLength(0);
			expect(records).toHaveLength(0);
			expect(lineItems).toHaveLength(0);
		});

		it("deletes pending invitations together with the budget", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-delete-invites-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-delete-invites-invitee",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Pending invites", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: invitee.id,
				status: "pending",
			});

			const [ownerInvites, inviteeInvites] = await Promise.all([
				budgetService.listInvitesByUserId(owner.id),
				budgetService.listInvitesByUserId(invitee.id),
			]);

			expect(ownerInvites.data).toHaveLength(1);
			expect(inviteeInvites.data).toHaveLength(1);

			await budgetService.deleteBudgetByUserId(owner.id, budget.id);

			const [members, ownerInvitesAfter, inviteeInvitesAfter] =
				await Promise.all([
					db
						.select()
						.from(budgetMemberTable)
						.where(eq(budgetMemberTable.budgetId, budget.id)),
					budgetService.listInvitesByUserId(owner.id),
					budgetService.listInvitesByUserId(invitee.id),
				]);

			expect(members).toHaveLength(0);
			expect(ownerInvitesAfter.data).toEqual([]);
			expect(inviteeInvitesAfter.data).toEqual([]);
		});

		it("rejects a member and leaves the budget in place", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-delete-denied-owner",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-delete-denied-member",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Kept", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: member.id,
				status: "active",
			});

			await expect(
				budgetService.deleteBudgetByUserId(member.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);

			const budgets = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.id, budget.id));

			expect(budgets).toHaveLength(1);
		});
	});

	describe("leave budget by user id", () => {
		it("removes an active membership", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-leave-owner",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-leave-member",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: member.id,
				status: "active",
			});

			await expect(
				budgetService.leaveBudgetByUserId(member.id, budget.id),
			).resolves.toEqual({
				data: { message: BUDGET_LEFT_MESSAGE },
			});

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));
			const budgets = await db
				.select()
				.from(budgetTable)
				.where(eq(budgetTable.id, budget.id));

			expect(members).toHaveLength(0);
			expect(budgets).toHaveLength(1);

			const audits = await db
				.select()
				.from(budgetAuditsTable)
				.where(eq(budgetAuditsTable.budgetId, budget.id));

			expect(audits).toEqual([
				expect.objectContaining({
					actorUserId: member.id,
					event: BUDGET_EVENTS.left,
					metadata: { userId: member.id },
				}),
			]);
		});

		it("rejects the owner, a pending member, and a stranger", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-leave-denied-owner",
			});
			const pendingMember = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-leave-denied-pending",
			});
			const stranger = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-leave-denied-stranger",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
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
				budgetService.leaveBudgetByUserId(owner.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				budgetService.leaveBudgetByUserId(pendingMember.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				budgetService.leaveBudgetByUserId(stranger.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toEqual([
				expect.objectContaining({
					userId: pendingMember.id,
					status: "pending",
				}),
			]);
		});
	});

	describe("accept invite by user id", () => {
		it("activates a pending invitation", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-accept-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-accept-invitee",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: invitee.id,
				status: "pending",
			});

			await expect(
				budgetService.acceptInviteByUserId(invitee.id, budget.id),
			).resolves.toEqual({
				data: { message: BUDGET_INVITE_ACCEPTED_MESSAGE },
			});

			const [member] = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(member).toMatchObject({
				userId: invitee.id,
				status: "active",
			});
		});

		it("does not activate an invitation when the caller has none pending", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-accept-denied-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-accept-denied-invitee",
			});
			const stranger = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-accept-denied-stranger",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: invitee.id,
				status: "pending",
			});

			await expect(
				budgetService.acceptInviteByUserId(owner.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				budgetService.acceptInviteByUserId(stranger.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);

			const [member] = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(member).toMatchObject({ status: "pending" });
		});
	});

	describe("reject invite by user id", () => {
		it("removes a pending invitation", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-reject-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-reject-invitee",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: invitee.id,
				status: "pending",
			});

			await expect(
				budgetService.rejectInviteByUserId(invitee.id, budget.id),
			).resolves.toEqual({
				data: { message: BUDGET_INVITE_REJECTED_MESSAGE },
			});

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toHaveLength(0);
		});

		it("does not remove an active membership", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-reject-denied-owner",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-reject-denied-member",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: member.id,
				status: "active",
			});

			await expect(
				budgetService.rejectInviteByUserId(owner.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				budgetService.rejectInviteByUserId(member.id, budget.id),
			).rejects.toBeInstanceOf(ORPCError);

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toHaveLength(1);
		});
	});

	describe("cancel invite by user id", () => {
		it("removes a pending invitation from the budget", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-cancel-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-cancel-invitee",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values({
				budgetId: budget.id,
				userId: invitee.id,
				status: "pending",
			});

			await expect(
				budgetService.cancelInviteByUserId(owner.id, {
					id: budget.id,
					userId: invitee.id,
				}),
			).resolves.toEqual({
				data: { message: BUDGET_INVITE_CANCELLED_MESSAGE },
			});

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toHaveLength(0);
		});

		it("does not remove a pending invitation or an active membership when cancel is not allowed", async () => {
			const db = moduleRef.get(DBS.APP);
			const owner = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-cancel-denied-owner",
			});
			const invitee = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-cancel-denied-invitee",
			});
			const member = await createTestUser(usersService, {
				passwordHash: "hash",
				emailTag: "budget-cancel-denied-member",
			});

			const [budget] = await db
				.insert(budgetTable)
				.values({ title: "Shared", ownerId: owner.id })
				.returning({ id: budgetTable.id });

			if (!budget) {
				throw new Error("Expected seeded budget");
			}

			await db.insert(budgetMemberTable).values([
				{
					budgetId: budget.id,
					userId: invitee.id,
					status: "pending",
				},
				{
					budgetId: budget.id,
					userId: member.id,
					status: "active",
				},
			]);

			await expect(
				budgetService.cancelInviteByUserId(invitee.id, {
					id: budget.id,
					userId: member.id,
				}),
			).rejects.toBeInstanceOf(ORPCError);
			await expect(
				budgetService.cancelInviteByUserId(owner.id, {
					id: budget.id,
					userId: member.id,
				}),
			).rejects.toBeInstanceOf(ORPCError);

			const members = await db
				.select()
				.from(budgetMemberTable)
				.where(eq(budgetMemberTable.budgetId, budget.id));

			expect(members).toHaveLength(2);
		});
	});
});
