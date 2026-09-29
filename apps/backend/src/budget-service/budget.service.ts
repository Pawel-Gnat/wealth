import { Inject, Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
import { BUDGET_CREATED_MESSAGE } from "@repo/api/schemas";
import type {
	BudgetCreatePayload,
	BudgetCreateResponse,
	BudgetInvitesResponse,
	BudgetListResponse,
	BudgetMember,
	User,
} from "@repo/api/types";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants";
import {
	budgetMemberTable,
	budgetTable,
} from "../database-service/tables/index";
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
}
