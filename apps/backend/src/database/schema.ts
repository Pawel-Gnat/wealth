import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { timestamp } from "./schema-helpers";

export const usersTable = pgTable("users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
