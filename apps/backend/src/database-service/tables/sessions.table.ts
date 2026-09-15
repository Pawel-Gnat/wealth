import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamp as defaultTimestamp, ulidPrimaryKey } from "./helpers.js";
import { usersTable } from "./users.table.js";

export const sessionsTable = pgTable(
	"sessions",
	{
		id: ulidPrimaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		sessionHash: text("session_hash").notNull().unique(),
		refreshHash: text("refresh_hash").notNull().unique(),
		sessionExpiresAt: timestamp("session_expires_at").notNull(),
		refreshExpiresAt: timestamp("refresh_expires_at").notNull(),
		previousRefreshHash: text("previous_refresh_hash").unique(),
		previousRefreshValidUntil: timestamp("previous_refresh_valid_until"),
		createdAt: defaultTimestamp("created_at"),
	},
	(table) => [index("sessions_user_id_idx").on(table.userId)],
);
