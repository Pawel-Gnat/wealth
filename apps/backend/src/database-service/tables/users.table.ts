import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers";
import { storageTable } from "./storage.table";

export const usersTable = pgTable("users", {
	id: ulidPrimaryKey(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	image: text("image").references(() => storageTable.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
