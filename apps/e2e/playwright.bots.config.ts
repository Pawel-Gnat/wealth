import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const e2ePackageDir = dirname(fileURLToPath(import.meta.url));
const envPath = join(e2ePackageDir, ".env");

if (existsSync(envPath)) {
	loadEnvFile(envPath);
}

const frontendUrl = process.env["FRONTEND_URL"]?.trim();
const botPassword = process.env["BOT_PASSWORD"]?.trim();
const isCi = !!process.env["CI"];

if (!frontendUrl) {
	throw new Error("FRONTEND_URL is required for bots tests");
}

if (!botPassword) {
	throw new Error("BOT_PASSWORD is required for bots tests");
}

export default defineConfig({
	testDir: "./src/specs/bots",
	forbidOnly: isCi,
	retries: 0,
	timeout: 45_000,
	expect: { timeout: 30_000 },
	use: {
		baseURL: frontendUrl,
		trace: "off",
		screenshot: "off",
		video: "off",
		actionTimeout: isCi ? 30_000 : 15_000,
		navigationTimeout: isCi ? 30_000 : 15_000,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
