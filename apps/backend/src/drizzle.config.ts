import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database/tables/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
