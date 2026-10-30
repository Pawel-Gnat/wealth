import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamptz, ulidPrimaryKey } from "./helpers";
import { usersTable } from "./users.table";

export const notificationsTable = pgTable(
	"notifications",
	{
		id: ulidPrimaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		event: text("event").notNull(),
		metadata: jsonb("metadata").notNull().default({}),
		readAt: timestamp("read_at", { withTimezone: true }),
		createdAt: timestamptz("created_at"),
	},
	(table) => [
		index("notifications_user_id_created_at_id_idx").on(
			table.userId,
			table.createdAt,
			table.id,
		),
	],
);
