import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { notificationsTable, usersTable } from "../tables/index";

export type UserRow = typeof usersTable.$inferSelect;
export type NotificationRow = typeof notificationsTable.$inferSelect;

export type Database = NodePgDatabase;

export type DatabaseTransaction = Parameters<
	Parameters<Database["transaction"]>[0]
>[0];
