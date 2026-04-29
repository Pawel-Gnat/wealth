import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const e2eSrcDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(e2eSrcDir, "..", "..", "..");
const webUrl = process.env["VITE_WEB_URL"] ?? "http://localhost:3000";
const backendReadyUrl = "http://localhost:4000/api-docs/";
const isCi = !!process.env["CI"];

export default defineConfig({
	testDir: join(e2eSrcDir, "specs"),
	forbidOnly: isCi,
	retries: isCi ? 2 : 0,
	timeout: 30_000,
	expect: { timeout: 10_000 },
	fullyParallel: false,
	outputDir: join(e2eSrcDir, "test-results"),
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
			command: "pnpm exec tsx src/infra/run-api-for-e2e.ts",
			cwd: join(repoRoot, "apps", "e2e"),
			url: backendReadyUrl,
			reuseExistingServer: !isCi,
			timeout: 180_000,
		},
		{
			command: "pnpm --filter web dev",
			cwd: repoRoot,
			url: webUrl,
			reuseExistingServer: !isCi,
			timeout: 180_000,
			env: {
				...process.env,
				VITE_BACKEND_URL: "http://localhost:4000",
			},
		},
	],
});
