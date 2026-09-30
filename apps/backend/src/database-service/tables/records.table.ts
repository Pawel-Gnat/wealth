import { recordKinds } from "@repo/api/schemas";
import { sql } from "drizzle-orm";
import {
	check,
	date,
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
} from "drizzle-orm/pg-core";
import { budgetTable } from "./budgets.table";
import { timestamp, ulidPrimaryKey } from "./helpers";
import { usersTable } from "./users.table";

export const recordKindEnum = pgEnum("document_kind", recordKinds);

export const recordsTable = pgTable(
	"records",
	{
		id: ulidPrimaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id),
		budgetId: text("budget_id").references(() => budgetTable.id, {
			onDelete: "cascade",
		}),
		kind: recordKindEnum("kind").notNull(),
		totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
			.notNull()
			.default("0"),
		documentDate: date("document_date").notNull(),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		index("documents_user_id_idx").on(table.userId),
		index("documents_budget_id_idx").on(table.budgetId),
		check(
			"documents_total_amount_non_negative",
			sql`${table.totalAmount} >= 0`,
		),
	],
);
