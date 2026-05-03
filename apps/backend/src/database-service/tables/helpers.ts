import { timestamp as pgTimestamp } from "drizzle-orm/pg-core";

export function timestamp(name: string) {
	return pgTimestamp(name).notNull().defaultNow();
}
