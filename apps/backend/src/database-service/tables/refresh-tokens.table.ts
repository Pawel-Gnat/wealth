import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { timestamp as defaultTimestamp, ulidPrimaryKey } from "./helpers.js";
import { usersTable } from "./users.table.js";

export const refreshTokensTable = pgTable("refresh_tokens", {
	id: ulidPrimaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	tokenHash: text("token_hash").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: defaultTimestamp("created_at"),
	revokedAt: timestamp("revoked_at"),
});
