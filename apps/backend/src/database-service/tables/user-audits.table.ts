import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers";
import { usersTable } from "./users.table";

export const userAuditsTable = pgTable(
	"user_audits",
	{
		id: ulidPrimaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		event: text("event").notNull(),
		subjectType: text("subject_type").notNull(),
		subjectId: text("subject_id").notNull(),
		changes: jsonb("changes").notNull().default([]),
		createdAt: timestamp("created_at"),
	},
	(table) => [
		index("user_audits_user_id_created_at_id_idx").on(
			table.userId,
			table.createdAt,
			table.id,
		),
	],
);
