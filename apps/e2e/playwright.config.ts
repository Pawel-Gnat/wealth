import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const e2ePackageDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(e2ePackageDir,   "../..");
const backendBase =
	process.env["BACKEND_URL"] ?? "http://localhost:4000";
const webUrl =
	process.env["FRONTEND_URL"] ??
	"http://localhost:3000";
const backendUrl = `${backendBase}/api-docs/`;
const isCi = !!process.env["CI"];

export default defineConfig({
    testDir: "./src/specs",
	forbidOnly: isCi,
	retries: isCi ? 2 : 0,
	timeout: 45_000,
	expect: { timeout: 30_000 },
	outputDir: "./src/test-results",
	use: {
		baseURL: webUrl,
		trace: "on-first-retry",
		actionTimeout: isCi ? 30_000 : 15_000,
		navigationTimeout: isCi ? 30_000 : 15_000,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	...(isCi ? { workers: 1 } : {}),
	webServer: [
		{
			name: "API",
			command: "pnpm --filter backend start:e2e",
			cwd: repoRoot,
			url: backendUrl,
			reuseExistingServer: !isCi,
			timeout: 180_000,
		},
		{
			name: "Vite",
			command: "pnpm --filter web dev",
			cwd: repoRoot,
			url: webUrl,
			reuseExistingServer: !isCi,
			timeout: 120_000,
			env: {
				VITE_BACKEND_URL: backendBase,
			},
		},
	],
});
