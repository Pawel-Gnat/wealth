import { budgetMemberStatuses } from "@repo/api/schemas";
import { index, pgEnum, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { budgetTable } from "./budgets.table";
import { timestamp } from "./helpers";
import { usersTable } from "./users.table";

export const budgetMemberStatusEnum = pgEnum(
	"budget_member_status",
	budgetMemberStatuses,
);

export const budgetMemberTable = pgTable(
	"budget_members",
	{
		budgetId: text("budget_id")
			.notNull()
			.references(() => budgetTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		status: budgetMemberStatusEnum("status").notNull().default("pending"),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		primaryKey({ columns: [table.budgetId, table.userId] }),
		index("budget_members_user_id_idx").on(table.userId),
	],
);
