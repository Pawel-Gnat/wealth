import type { usersTable } from "../tables/index";

export type UserRow = typeof usersTable.$inferSelect;
