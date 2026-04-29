import { defineConfig, devices } from "@playwright/test";

const webUrl = process.env["VITE_WEB_URL"] ?? `http://127.0.0.1:3000`;
const isCi = !!process.env["CI"];

export default defineConfig({
	testDir: "./src/test/e2e",
	globalSetup: "./src/test/e2e/global-setup.ts",
	fullyParallel: false,
	forbidOnly: isCi,
	retries: isCi ? 2 : 0,
	timeout: 30_000,
	expect: {
		timeout: 10_000,
	},
	use: {
		baseURL: webUrl,
		trace: "on-first-retry",
		actionTimeout: isCi ? 30000 : 15000,
		navigationTimeout: isCi ? 30000 : 15000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	...(isCi
		? { workers: 1 }
		: {
				webServer: {
					command: "pnpm run dev",
					url: webUrl,
					reuseExistingServer: true,
					timeout: 120_000,
				},
			}),
});
