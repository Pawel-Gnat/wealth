import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamp, ulidPrimaryKey } from "./helpers.js";

export const storageTable = pgTable("storage", {
	id: ulidPrimaryKey(),
	objectKey: text("object_key").notNull().unique(),
	createdAt: timestamp("created_at"),
});
