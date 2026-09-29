import { relations } from "drizzle-orm";
import { budgetMemberTable } from "./budget-members.table";
import { budgetTable } from "./budgets.table";
import { documentLineItemsTable } from "./document-line-items.table";
import { documentsTable } from "./documents.table";
import { sessionsTable } from "./sessions.table";
import { usersTable } from "./users.table";

export const usersRelations = relations(usersTable, ({ many }) => ({
	documents: many(documentsTable),
	sessions: many(sessionsTable),
	budgets: many(budgetTable),
	budgetMembers: many(budgetMemberTable),
}));

export const documentsRelations = relations(
	documentsTable,
	({ one, many }) => ({
		user: one(usersTable, {
			fields: [documentsTable.userId],
			references: [usersTable.id],
		}),
		budget: one(budgetTable, {
			fields: [documentsTable.budgetId],
			references: [budgetTable.id],
		}),
		lineItems: many(documentLineItemsTable),
	}),
);

export const documentLineItemsRelations = relations(
	documentLineItemsTable,
	({ one }) => ({
		document: one(documentsTable, {
			fields: [documentLineItemsTable.documentId],
			references: [documentsTable.id],
		}),
	}),
);

export const budgetRelations = relations(budgetTable, ({ one, many }) => ({
	owner: one(usersTable, {
		fields: [budgetTable.ownerId],
		references: [usersTable.id],
	}),
	members: many(budgetMemberTable),
	documents: many(documentsTable),
}));

export const budgetMemberRelations = relations(
	budgetMemberTable,
	({ one }) => ({
		budget: one(budgetTable, {
			fields: [budgetMemberTable.budgetId],
			references: [budgetTable.id],
		}),
		user: one(usersTable, {
			fields: [budgetMemberTable.userId],
			references: [usersTable.id],
		}),
	}),
);

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [sessionsTable.userId],
		references: [usersTable.id],
	}),
}));
