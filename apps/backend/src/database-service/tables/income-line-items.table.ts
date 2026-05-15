import { index, integer, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers.js";
import { incomeDocumentsTable } from "./income-documents.table.js";

export const incomeLineItemsTable = pgTable(
	"income_line_items",
	{
		id: ulidPrimaryKey(),
		incomeDocumentId: text("income_document_id")
			.notNull()
			.references(() => incomeDocumentsTable.id, { onDelete: "cascade" }),
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
		index("income_line_items_income_document_id_idx").on(
			table.incomeDocumentId,
		),
	],
);
