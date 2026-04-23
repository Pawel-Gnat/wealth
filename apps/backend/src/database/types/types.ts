import type { usersTable } from "../tables/index.js";

export type UserRow = typeof usersTable.$inferSelect;
