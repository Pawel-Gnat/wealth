import { relations } from "drizzle-orm";
import { expenseDocumentsTable } from "./expense-documents.table.js";
import { expenseLineItemsTable } from "./expense-line-items.table.js";
import { usersTable } from "./users.table.js";

export const usersRelations = relations(usersTable, ({ many }) => ({
	expenseDocuments: many(expenseDocumentsTable),
}));

export const expenseDocumentsRelations = relations(
	expenseDocumentsTable,
	({ one, many }) => ({
		user: one(usersTable, {
			fields: [expenseDocumentsTable.userId],
			references: [usersTable.id],
		}),
		lineItems: many(expenseLineItemsTable),
	}),
);

export const expenseLineItemsRelations = relations(
	expenseLineItemsTable,
	({ one }) => ({
		expenseDocument: one(expenseDocumentsTable, {
			fields: [expenseLineItemsTable.expenseDocumentId],
			references: [expenseDocumentsTable.id],
		}),
	}),
);
