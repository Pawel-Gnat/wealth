import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

const envPath = resolve(process.cwd(), "../../.env");

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
