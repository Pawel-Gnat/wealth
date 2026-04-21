import type { usersTable } from "./schema";

export type UserRow = typeof usersTable.$inferSelect;
