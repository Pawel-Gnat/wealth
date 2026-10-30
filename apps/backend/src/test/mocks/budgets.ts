import {
	budgetMemberTable,
	budgetTable,
} from "../../database-service/tables/index";
import type { Database } from "../../database-service/types/types";

type SeedBudgetMember = {
	userId: string;
	status: "active" | "pending";
};

export const seedBudget = async (
	db: Database,
	ownerId: string,
	title: string,
	members: SeedBudgetMember[] = [],
) => {
	const [budget] = await db
		.insert(budgetTable)
		.values({ title, ownerId })
		.returning({ id: budgetTable.id });

	if (!budget) {
		throw new Error("Expected seeded budget");
	}

	if (members.length > 0) {
		await db.insert(budgetMemberTable).values(
			members.map((member) => ({
				budgetId: budget.id,
				userId: member.userId,
				status: member.status,
			})),
		);
	}

	return budget;
};
