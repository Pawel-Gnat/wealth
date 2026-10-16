import type { BudgetAccess } from "@repo/common/permissions";
import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	budgetMemberTable,
	budgetTable,
} from "../../database-service/tables/index";

export const findBudgetAccess = async (
	db: NodePgDatabase,
	userId: string,
	budgetId: string,
): Promise<BudgetAccess | null> => {
	const [budget] = await db
		.select({
			ownerId: budgetTable.ownerId,
			membership: budgetMemberTable.status,
		})
		.from(budgetTable)
		.leftJoin(
			budgetMemberTable,
			and(
				eq(budgetMemberTable.budgetId, budgetTable.id),
				eq(budgetMemberTable.userId, userId),
			),
		)
		.where(eq(budgetTable.id, budgetId));

	if (!budget) {
		return null;
	}

	return {
		ownerId: budget.ownerId,
		membership: budget.membership,
	};
};
