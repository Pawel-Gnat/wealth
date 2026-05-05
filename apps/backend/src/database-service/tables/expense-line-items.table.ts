import { index, integer, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { expenseDocumentsTable } from "./expense-documents.table.js";
import { timestamp, ulidPrimaryKey } from "./helpers.js";

export const expenseLineItemsTable = pgTable(
	"expense_line_items",
	{
		id: ulidPrimaryKey(),
		expenseDocumentId: text("expense_document_id")
			.notNull()
			.references(() => expenseDocumentsTable.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		quantity: integer("quantity").notNull().default(1),
		singleAmount: numeric("single_amount", {
			precision: 14,
			scale: 2,
		}).notNull(),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		index("expense_line_items_expense_document_id_idx").on(
			table.expenseDocumentId,
		),
	],
);
