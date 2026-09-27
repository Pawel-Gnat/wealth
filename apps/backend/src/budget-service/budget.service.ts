import { Inject, Injectable } from "@nestjs/common";
import { BUDGET_CREATED_MESSAGE } from "@repo/api/schemas";
import type {
	BudgetCreatePayload,
	BudgetCreateResponse,
	BudgetInvitesResponse,
	BudgetListResponse,
	BudgetMember,
} from "@repo/api/types";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DBS } from "../database-service/constants.js";
import {
	budgetMemberTable,
	budgetTable,
	usersTable,
} from "../database-service/tables/index.js";

@Injectable()
export class BudgetService {
	constructor(@Inject(DBS.APP) private readonly db: NodePgDatabase) {}

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

		const membersByBudgetId = await this.membersByBudgetId(
			budgets.map((budget) => budget.id),
		);

		return {
			data: budgets.map((budget) => ({
				...budget,
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
				inviteeId: usersTable.id,
			})
			.from(budgetMemberTable)
			.innerJoin(budgetTable, eq(budgetMemberTable.budgetId, budgetTable.id))
			.innerJoin(usersTable, eq(budgetMemberTable.userId, usersTable.id))
			.where(
				and(
					eq(budgetMemberTable.status, "pending"),
					or(
						eq(budgetMemberTable.userId, userId),
						eq(budgetTable.ownerId, userId),
					),
				),
			)
			.orderBy(desc(budgetTable.createdAt), asc(usersTable.id));

		if (inviteRows.length === 0) {
			return { data: [] };
		}

		const membersByBudgetId = await this.membersByBudgetId([
			...new Set(inviteRows.map((row) => row.budgetId)),
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
							ownerId: row.ownerId,
							members,
						},
						invitee,
					},
				];
			}),
		};
	}

	private async membersByBudgetId(budgetIds: string[]) {
		const memberRows = await this.db
			.select({
				budgetId: budgetMemberTable.budgetId,
				status: budgetMemberTable.status,
				id: usersTable.id,
				email: usersTable.email,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
			})
			.from(budgetMemberTable)
			.innerJoin(usersTable, eq(budgetMemberTable.userId, usersTable.id))
			.where(inArray(budgetMemberTable.budgetId, budgetIds));

		const membersByBudgetId = new Map<string, BudgetMember[]>();

		for (const row of memberRows) {
			const members = membersByBudgetId.get(row.budgetId) ?? [];
			members.push({
				id: row.id,
				email: row.email,
				image: null,
				firstName: row.firstName,
				lastName: row.lastName,
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
