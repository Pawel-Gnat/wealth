import { timestamp as pgTimestamp, text } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export function timestamp(name: string) {
	return pgTimestamp(name).notNull().defaultNow();
}

export const timestamptz = (name: string) =>
	pgTimestamp(name, { withTimezone: true }).notNull().defaultNow();

export function ulidPrimaryKey(name = "id") {
	return text(name)
		.primaryKey()
		.$defaultFn(() => ulid());
}
