import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers.js";

export const usersTable = pgTable("users", {
	id: ulidPrimaryKey(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
