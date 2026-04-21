import { usersTable } from "./schema";

export type UserRow = typeof usersTable.$inferSelect;