import { Inject, Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
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
import type {
	BudgetCancelInviteInput,
	BudgetCreatePayload,
	BudgetCreateResponse,
	BudgetDeleteResponse,
	BudgetInviteAcceptedResponse,
	BudgetInviteCancelledResponse,
	BudgetInviteMembersInput,
	BudgetInviteMembersResponse,
	BudgetInviteRejectedResponse,
	BudgetInvitesResponse,
	BudgetLeaveResponse,
	BudgetListResponse,
	BudgetMember,
	BudgetUpdateInput,
	BudgetUpdateResponse,
	User,
} from "@repo/api/types";
import { hasPermission, type Permissions } from "@repo/common/permissions";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants";
import {
	budgetMemberTable,
	budgetTable,
} from "../database-service/tables/index";
import { findBudgetAccess } from "../shared/budget/find-budget-access";
import { UsersService } from "../users-service/users.service";

@Injectable()
export class BudgetService {
	constructor(
		@Inject(DBS.APP) private readonly db: NodePgDatabase,
		private readonly usersService: UsersService,
	) {}

	async listBudgetsByUserId(userId: string): Promise<BudgetListResponse> {
		const activeMemberships = await this.db
			.select({ budgetId: budgetMemberTable.budgetId })
			.from(budgetMemberTable)
			.where(
				and(
					eq(budgetMemberTable.userId, userId),
					eq(budgetMemberTable.status, "active"),
				),
			);

		const memberBudgetIds = activeMemberships.map((row) => row.budgetId);

		const budgets = await this.db
			.select({
				id: budgetTable.id,
				title: budgetTable.title,
				ownerId: budgetTable.ownerId,
			})
			.from(budgetTable)
			.where(
				memberBudgetIds.length > 0
					? or(
							eq(budgetTable.ownerId, userId),
							inArray(budgetTable.id, memberBudgetIds),
						)
					: eq(budgetTable.ownerId, userId),
			)
			.orderBy(desc(budgetTable.createdAt));

		if (budgets.length === 0) {
			return { data: [] };
		}

		const budgetIds = budgets.map((budget) => budget.id);
		const [membersByBudgetId, ownersById] = await Promise.all([
			this.membersByBudgetId(budgetIds),
			this.usersService.findUsersByIds(budgets.map((budget) => budget.ownerId)),
		]);

		return {
			data: budgets.map((budget) => ({
				id: budget.id,
				title: budget.title,
				owner: this.ownerFor(ownersById, budget.ownerId),
				members: membersByBudgetId.get(budget.id) ?? [],
			})),
		};
	}

	async listInvitesByUserId(userId: string): Promise<BudgetInvitesResponse> {
		const inviteRows = await this.db
			.select({
				budgetId: budgetTable.id,
				title: budgetTable.title,
				ownerId: budgetTable.ownerId,
				inviteeId: budgetMemberTable.userId,
			})
			.from(budgetMemberTable)
			.innerJoin(budgetTable, eq(budgetMemberTable.budgetId, budgetTable.id))
			.where(
				and(
					eq(budgetMemberTable.status, "pending"),
					or(
						eq(budgetMemberTable.userId, userId),
						eq(budgetTable.ownerId, userId),
					),
				),
			)
			.orderBy(desc(budgetTable.createdAt), asc(budgetMemberTable.userId));

		if (inviteRows.length === 0) {
			return { data: [] };
		}

		const budgetIds = [...new Set(inviteRows.map((row) => row.budgetId))];
		const [membersByBudgetId, ownersById] = await Promise.all([
			this.membersByBudgetId(budgetIds),
			this.usersService.findUsersByIds(inviteRows.map((row) => row.ownerId)),
		]);

		return {
			data: inviteRows.flatMap((row) => {
				const members = membersByBudgetId.get(row.budgetId) ?? [];
				const invitee = members.find((member) => member.id === row.inviteeId);

				if (!invitee) {
					return [];
				}

				return [
					{
						budget: {
							id: row.budgetId,
							title: row.title,
							owner: this.ownerFor(ownersById, row.ownerId),
							members,
						},
						invitee,
					},
				];
			}),
		};
	}

	private ownerFor(ownersById: Map<string, User>, ownerId: string) {
		const owner = ownersById.get(ownerId);

		if (!owner) {
			throw new ORPCError("NOT_FOUND", {
				message: "Budget owner not found",
			});
		}

		return owner;
	}

	private async membersByBudgetId(budgetIds: string[]) {
		const memberRows = await this.db
			.select({
				budgetId: budgetMemberTable.budgetId,
				status: budgetMemberTable.status,
				userId: budgetMemberTable.userId,
			})
			.from(budgetMemberTable)
			.where(inArray(budgetMemberTable.budgetId, budgetIds));

		const usersById = await this.usersService.findUsersByIds(
			memberRows.map((row) => row.userId),
		);
		const membersByBudgetId = new Map<string, BudgetMember[]>();

		for (const row of memberRows) {
			const user = usersById.get(row.userId);

			if (!user) {
				continue;
			}

			const members = membersByBudgetId.get(row.budgetId) ?? [];
			members.push({
				...user,
				status: row.status,
			});
			membersByBudgetId.set(row.budgetId, members);
		}

		return membersByBudgetId;
	}

	async createBudgetByUserId(
		ownerId: string,
		payload: BudgetCreatePayload,
	): Promise<BudgetCreateResponse> {
		if (payload.memberIds.length > BUDGET_MEMBER_IDS_MAX) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Too many members",
			});
		}

		const inviteeIds = payload.memberIds.filter(
			(memberId) => memberId !== ownerId,
		);

		if (inviteeIds.length > 0) {
			const existingUsers = await this.usersService.findUsersByIds(inviteeIds);

			if (existingUsers.size !== inviteeIds.length) {
				throw new ORPCError("BAD_REQUEST", {
					message: "One or more members do not exist",
				});
			}
		}

		await this.db.transaction(async (tx) => {
			const [createdBudget] = await tx
				.insert(budgetTable)
				.values({
					title: payload.title,
					ownerId,
				})
				.returning({ id: budgetTable.id });

			if (!createdBudget) {
				throw new Error("Budget insert failed");
			}

			if (inviteeIds.length > 0) {
				await tx.insert(budgetMemberTable).values(
					inviteeIds.map((userId) => ({
						budgetId: createdBudget.id,
						userId,
					})),
				);
			}
		});

		return {
			data: {
				message: BUDGET_CREATED_MESSAGE,
			},
		};
	}

	async updateBudgetByUserId(
		userId: string,
		input: BudgetUpdateInput,
	): Promise<BudgetUpdateResponse> {
		await this.requireBudgetPermission(userId, input.id, "edit");

		await this.db
			.update(budgetTable)
			.set({ title: input.title })
			.where(eq(budgetTable.id, input.id));

		return {
			data: {
				message: BUDGET_UPDATED_MESSAGE,
			},
		};
	}

	async inviteMembersByUserId(
		userId: string,
		input: BudgetInviteMembersInput,
	): Promise<BudgetInviteMembersResponse> {
		await this.requireBudgetPermission(userId, input.id, "invite");

		const existingMembers = await this.db
			.select({ userId: budgetMemberTable.userId })
			.from(budgetMemberTable)
			.where(eq(budgetMemberTable.budgetId, input.id));
		const existingIds = new Set(existingMembers.map((row) => row.userId));
		const inviteeIds = input.memberIds.filter(
			(memberId) => memberId !== userId && !existingIds.has(memberId),
		);

		if (existingIds.size + inviteeIds.length > BUDGET_MEMBER_IDS_MAX) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Too many members",
			});
		}

		if (inviteeIds.length > 0) {
			const existingUsers = await this.usersService.findUsersByIds(inviteeIds);

			if (existingUsers.size !== inviteeIds.length) {
				throw new ORPCError("BAD_REQUEST", {
					message: "One or more members do not exist",
				});
			}

			await this.db.insert(budgetMemberTable).values(
				inviteeIds.map((memberId) => ({
					budgetId: input.id,
					userId: memberId,
				})),
			);
		}

		return {
			data: {
				message: BUDGET_MEMBERS_INVITED_MESSAGE,
			},
		};
	}

	async deleteBudgetByUserId(
		userId: string,
		budgetId: string,
	): Promise<BudgetDeleteResponse> {
		await this.requireBudgetPermission(userId, budgetId, "delete");

		await this.db.delete(budgetTable).where(eq(budgetTable.id, budgetId));

		return {
			data: {
				message: BUDGET_DELETED_MESSAGE,
			},
		};
	}

	async leaveBudgetByUserId(
		userId: string,
		budgetId: string,
	): Promise<BudgetLeaveResponse> {
		await this.requireBudgetPermission(userId, budgetId, "leave");

		const deleted = await this.db
			.delete(budgetMemberTable)
			.where(
				and(
					eq(budgetMemberTable.budgetId, budgetId),
					eq(budgetMemberTable.userId, userId),
					eq(budgetMemberTable.status, "active"),
				),
			)
			.returning({ userId: budgetMemberTable.userId });

		if (deleted.length === 0) {
			throw new ORPCError("NOT_FOUND", {
				message: "Budget not found",
			});
		}

		return {
			data: {
				message: BUDGET_LEFT_MESSAGE,
			},
		};
	}

	async acceptInviteByUserId(
		userId: string,
		budgetId: string,
	): Promise<BudgetInviteAcceptedResponse> {
		await this.requireBudgetPermission(userId, budgetId, "acceptInvite");

		const updated = await this.db
			.update(budgetMemberTable)
			.set({ status: "active" })
			.where(
				and(
					eq(budgetMemberTable.budgetId, budgetId),
					eq(budgetMemberTable.userId, userId),
					eq(budgetMemberTable.status, "pending"),
				),
			)
			.returning({ userId: budgetMemberTable.userId });

		if (updated.length === 0) {
			throw new ORPCError("NOT_FOUND", {
				message: "Budget not found",
			});
		}

		return {
			data: {
				message: BUDGET_INVITE_ACCEPTED_MESSAGE,
			},
		};
	}

	async rejectInviteByUserId(
		userId: string,
		budgetId: string,
	): Promise<BudgetInviteRejectedResponse> {
		await this.requireBudgetPermission(userId, budgetId, "rejectInvite");
		await this.deletePendingMembership(budgetId, userId);

		return {
			data: {
				message: BUDGET_INVITE_REJECTED_MESSAGE,
			},
		};
	}

	async cancelInviteByUserId(
		userId: string,
		input: BudgetCancelInviteInput,
	): Promise<BudgetInviteCancelledResponse> {
		await this.requireBudgetPermission(userId, input.id, "cancelInvite");
		await this.deletePendingMembership(input.id, input.userId);

		return {
			data: {
				message: BUDGET_INVITE_CANCELLED_MESSAGE,
			},
		};
	}

	private async deletePendingMembership(budgetId: string, userId: string) {
		const deleted = await this.db
			.delete(budgetMemberTable)
			.where(
				and(
					eq(budgetMemberTable.budgetId, budgetId),
					eq(budgetMemberTable.userId, userId),
					eq(budgetMemberTable.status, "pending"),
				),
			)
			.returning({ userId: budgetMemberTable.userId });

		if (deleted.length === 0) {
			throw new ORPCError("NOT_FOUND", {
				message: "Budget not found",
			});
		}
	}

	private async requireBudgetPermission(
		userId: string,
		budgetId: string,
		action: Permissions["budgets"]["action"],
	) {
		const budget = await findBudgetAccess(this.db, userId, budgetId);
		const allowed =
			budget !== null && hasPermission(userId, "budgets", action, budget);

		if (!allowed) {
			throw new ORPCError("NOT_FOUND", {
				message: "Budget not found",
			});
		}
	}
}
