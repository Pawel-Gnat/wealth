import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { timestamp as defaultTimestamp, ulidPrimaryKey } from "./helpers.js";
import { usersTable } from "./users.table.js";

export const refreshTokensTable = pgTable(
	"refresh_tokens",
	{
		id: ulidPrimaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		sessionId: text("session_id")
			.notNull()
			.$defaultFn(() => ulid()),
		tokenHash: text("token_hash").notNull().unique(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: defaultTimestamp("created_at"),
		revokedAt: timestamp("revoked_at"),
	},
	(table) => [
		index("refresh_tokens_user_id_session_id_idx").on(
			table.userId,
			table.sessionId,
		),
	],
);
