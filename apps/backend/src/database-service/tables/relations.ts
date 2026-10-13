import { relations } from "drizzle-orm";
import { budgetMemberTable } from "./budget-members.table";
import { budgetTable } from "./budgets.table";
import { recordLineItemsTable } from "./record-line-items.table";
import { recordsTable } from "./records.table";
import { sessionsTable } from "./sessions.table";
import { usersTable } from "./users.table";

export const usersRelations = relations(usersTable, ({ many }) => ({
	records: many(recordsTable),
	sessions: many(sessionsTable),
	budgets: many(budgetTable),
	budgetMembers: many(budgetMemberTable),
}));

export const recordsRelations = relations(recordsTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [recordsTable.userId],
		references: [usersTable.id],
	}),
	budget: one(budgetTable, {
		fields: [recordsTable.budgetId],
		references: [budgetTable.id],
	}),
	lineItems: many(recordLineItemsTable),
}));

export const recordLineItemsRelations = relations(
	recordLineItemsTable,
	({ one }) => ({
		record: one(recordsTable, {
			fields: [recordLineItemsTable.documentId],
			references: [recordsTable.id],
		}),
	}),
);

export const budgetRelations = relations(budgetTable, ({ one, many }) => ({
	owner: one(usersTable, {
		fields: [budgetTable.ownerId],
		references: [usersTable.id],
	}),
	members: many(budgetMemberTable),
	records: many(recordsTable),
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
