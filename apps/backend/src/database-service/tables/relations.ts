import { relations } from "drizzle-orm";
import { expenseDocumentsTable } from "./expense-documents.table.js";
import { expenseLineItemsTable } from "./expense-line-items.table.js";
import { incomeDocumentsTable } from "./income-documents.table.js";
import { incomeLineItemsTable } from "./income-line-items.table.js";
import { usersTable } from "./users.table.js";

export const usersRelations = relations(usersTable, ({ many }) => ({
	expenseDocuments: many(expenseDocumentsTable),
	incomeDocuments: many(incomeDocumentsTable),
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

export const incomeDocumentsRelations = relations(
	incomeDocumentsTable,
	({ one, many }) => ({
		user: one(usersTable, {
			fields: [incomeDocumentsTable.userId],
			references: [usersTable.id],
		}),
		lineItems: many(incomeLineItemsTable),
	}),
);

export const incomeLineItemsRelations = relations(
	incomeLineItemsTable,
	({ one }) => ({
		incomeDocument: one(incomeDocumentsTable, {
			fields: [incomeLineItemsTable.incomeDocumentId],
			references: [incomeDocumentsTable.id],
		}),
	}),
);
