import { sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	numeric,
	pgTable,
	text,
} from "drizzle-orm/pg-core";
import { documentsTable } from "./documents.table";
import { timestamp, ulidPrimaryKey } from "./helpers";

export const documentLineItemsTable = pgTable(
	"document_line_items",
	{
		id: ulidPrimaryKey(),
		documentId: text("document_id")
			.notNull()
			.references(() => documentsTable.id, { onDelete: "cascade" }),
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
		index("document_line_items_document_id_idx").on(table.documentId),
		check(
			"document_line_items_title_not_blank",
			sql`char_length(btrim(${table.title})) > 0`,
		),
		check("document_line_items_quantity_min", sql`${table.quantity} >= 1`),
		check(
			"document_line_items_single_amount_min",
			sql`${table.singleAmount} >= 0.01`,
		),
	],
);
