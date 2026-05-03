import {
	index,
	integer,
	numeric,
	pgTable,
	serial,
	text,
} from "drizzle-orm/pg-core";
import { timestamp } from "./helpers.js";
import { usersTable } from "./users.table.js";

export const expenseDocumentsTable = pgTable(
	"expense_documents",
	{
		id: serial("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		userId: integer("user_id")
			.notNull()
			.references(() => usersTable.id),
		totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
			.notNull()
			.default("0"),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [index("expense_documents_user_id_idx").on(table.userId)],
);
