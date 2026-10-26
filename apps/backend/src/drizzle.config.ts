import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

const envPath = join(__dirname, "../../../.env");

if (existsSync(envPath)) {
	loadEnvFile(envPath);
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database-service/tables/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
