import { defineConfig, devices } from '@playwright/test'

const backendPort = 3100
const webPort = 4173
const backendUrl = `http://127.0.0.1:${backendPort}`
const webUrl = `http://127.0.0.1:${webPort}`

export default defineConfig({
	testDir: './src/test/e2e',
	globalSetup: './src/test/e2e/global-setup.ts',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
	timeout: 30_000,
	expect: {
		timeout: 10_000,
	},
	use: {
		baseURL: webUrl,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: [
		{
			command: `PORT=${backendPort} pnpm --filter backend db:migrate && PORT=${backendPort} pnpm --filter backend dev`,
			url: `${backendUrl}/api-docs`,
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
		},
		{
			command: `VITE_BACKEND_URL="${backendUrl}" pnpm --filter web dev -- --port ${webPort} --strictPort`,
			url: `${webUrl}/auth`,
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
		},
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   url: 'http://localhost:3000',
	//   reuseExistingServer: !process.env.CI,
	// },
})
