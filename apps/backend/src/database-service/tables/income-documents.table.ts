import { index, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers.js";
import { usersTable } from "./users.table.js";

export const incomeDocumentsTable = pgTable(
	"income_documents",
	{
		id: ulidPrimaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id),
		totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
			.notNull()
			.default("0"),
		incomeDate: timestamp("income_date"),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [index("income_documents_user_id_idx").on(table.userId)],
);
