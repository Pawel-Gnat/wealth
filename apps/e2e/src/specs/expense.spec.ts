import { expect, test } from "./helpers/test.js";

function formatUsd(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

test("expense document lifecycle", async ({ page, loginAsTestUser }) => {
	await loginAsTestUser();

	await page.goto("/expenses/new");
	await expect(
		page.getByRole("heading", { name: "Create a new expense" }),
	).toBeVisible();

	await page.getByLabel("Expense").nth(0).fill("Coffee");
	await page.getByLabel("Price").nth(0).fill("10");
	await page.getByLabel("Quantity").nth(0).fill("2");

	await page.getByRole("button", { name: "Add" }).click();

	await page.getByLabel("Expense").nth(1).fill("Taxi");
	await page.getByLabel("Price").nth(1).fill("7");
	await page.getByLabel("Quantity").nth(1).fill("3");

	const initialTotal = 10 * 2 + 7 * 3;
	const initialFormatted = formatUsd(initialTotal);

	await page.getByRole("button", { name: "Create" }).click();
	await expect(page).toHaveURL("/expenses");

	const tbody = page.locator('[data-slot="table-body"]');
	const initialRow = tbody
		.getByRole("row")
		.filter({ hasText: initialFormatted });
	await expect(initialRow).toBeVisible();

	await initialRow.getByRole("link", { name: /^edit$/i }).click();
	await expect(page.getByRole("heading", { name: "Edit expense" })).toBeVisible();

	await page.getByLabel("Expense").nth(0).fill("Coffee XL");
	await page.getByLabel("Price").nth(0).fill("25");
	await page.getByLabel("Quantity").nth(0).fill("1");
	await page.getByLabel("Expense").nth(1).fill("Taxi XL");
	await page.getByLabel("Price").nth(1).fill("25");
	await page.getByLabel("Quantity").nth(1).fill("1");

	const updatedTotal = 50;
	const updatedFormatted = formatUsd(updatedTotal);

	await page.getByRole("button", { name: "Save" }).click();
	await expect(page).toHaveURL("/expenses");

	const updatedRow = tbody
		.getByRole("row")
		.filter({ hasText: updatedFormatted });
	await expect(updatedRow).toBeVisible();
	await expect(
		tbody.getByRole("row").filter({ hasText: initialFormatted }),
	).toHaveCount(0);

	await updatedRow.getByRole("button", { name: /^delete$/i }).click();

	await expect(
		tbody.getByRole("row").filter({ hasText: updatedFormatted }),
	).toHaveCount(0);
});
