import { expect, test } from "@playwright/test";

test("opens app and lands on /auth", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveURL(/\/auth$/);
});
