import { expect, test as base } from "@playwright/test";

export const E2E_EMAIL = "test@example.com";
export const E2E_PASSWORD = "Password123!";

type Fixtures = {
	loginAsTestUser: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
	loginAsTestUser: async ({ page }, run) => {
		const loginAsTestUser = async () => {
			await page.goto("/auth");

			await page.getByRole("tab", { name: "Sign up" }).click();
			await page.getByLabel("Email").fill(E2E_EMAIL);
			await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
			await page.getByLabel("Confirm password").fill(E2E_PASSWORD);

			await page.getByRole("button", { name: "Sign up" }).click();
			await expect(page.getByRole("button", { name: "Sign up" })).toBeEnabled({
				timeout: 30_000,
			});

			await page.getByRole("tab", { name: "Sign in" }).click();
			await page.getByLabel("Email").fill(E2E_EMAIL);
			await page.getByLabel("Password").fill(E2E_PASSWORD);
			await page.getByRole("button", { name: "Sign in" }).click();
			await expect(page).toHaveURL("/", { timeout: 30_000 });
		};

		await run(loginAsTestUser);
	},
});
