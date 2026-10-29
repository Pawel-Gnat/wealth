import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { budgetTable } from "./budgets.table";
import { timestamptz, ulidPrimaryKey } from "./helpers";
import { usersTable } from "./users.table";

export const budgetAuditsTable = pgTable(
	"budget_audits",
	{
		id: ulidPrimaryKey(),
		budgetId: text("budget_id")
			.notNull()
			.references(() => budgetTable.id, { onDelete: "cascade" }),
		actorUserId: text("actor_user_id").references(() => usersTable.id, {
			onDelete: "set null",
		}),
		event: text("event").notNull(),
		entityId: text("entity_id").notNull(),
		metadata: jsonb("metadata").notNull().default({}),
		createdAt: timestamptz("created_at"),
	},
	(table) => [
		index("budget_audits_budget_id_created_at_id_idx").on(
			table.budgetId,
			table.createdAt,
			table.id,
		),
	],
);
