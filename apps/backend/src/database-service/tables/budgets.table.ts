import { index, pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers";
import { usersTable } from "./users.table";

export const budgetTable = pgTable(
	"budgets",
	{
		id: ulidPrimaryKey(),
		title: text("title").notNull(),
		ownerId: text("owner_id")
			.notNull()
			.references(() => usersTable.id),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [index("budgets_owner_id_idx").on(table.ownerId)],
);
