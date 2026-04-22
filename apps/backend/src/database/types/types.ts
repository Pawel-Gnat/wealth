import type { usersTable } from "../tables";

export type UserRow = typeof usersTable.$inferSelect;
