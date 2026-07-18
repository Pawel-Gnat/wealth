import { ensureI18nInit, getI18nText } from './helpers/i18n'
import { expect, test } from './helpers/test'

function formatUsd(amount: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

test('expense document lifecycle', async ({ page, loginAsTestUser }) => {
	await ensureI18nInit()
	await loginAsTestUser()

	const expenseLabel = getI18nText('form', 'line-item.expense-label')
	const priceLabel = getI18nText('form', 'single-amount.label')
	const quantityLabel = getI18nText('form', 'quantity.label')
	const saveButton = getI18nText('common', 'action.save')
	const createButton = getI18nText('common', 'action.create')
	const addLineButton = getI18nText('common', 'action.add')
	const editButton = getI18nText('common', 'action.edit')
	const deleteButton = getI18nText('common', 'action.delete')
	const createExpenseText = getI18nText('expenses', 'single.title-create')
	const editExpenseText = getI18nText('expenses', 'single.title-edit')
	const deleteExpenseTitle = getI18nText('expenses', 'delete.title')

	await page.goto('/expenses/new')
	await expect(page.getByRole('heading', { name: createExpenseText })).toBeVisible()

	await page.getByLabel(expenseLabel).nth(0).fill('Coffee')
	await page.getByLabel(priceLabel).nth(0).fill('10')
	await page.getByLabel(quantityLabel).nth(0).fill('2')

	await page.getByRole('button', { name: addLineButton }).click()

	await page.getByLabel(expenseLabel).nth(1).fill('Taxi')
	await page.getByLabel(priceLabel).nth(1).fill('7')
	await page.getByLabel(quantityLabel).nth(1).fill('3')

	const initialTotal = 10 * 2 + 7 * 3
	const initialFormatted = formatUsd(initialTotal)

	await page.getByRole('button', { name: createButton }).click()
	await expect(page).toHaveURL('/expenses')

	const tbody = page.locator('[data-slot="table-body"]')
	const initialRow = tbody.getByRole('row').filter({ hasText: initialFormatted })
	await expect(initialRow).toBeVisible()

	await initialRow.getByRole('link', { name: editButton }).click()
	await expect(page.getByRole('heading', { name: editExpenseText })).toBeVisible()

	await page.getByLabel(expenseLabel).nth(0).fill('Coffee XL')
	await page.getByLabel(priceLabel).nth(0).fill('25')
	await page.getByLabel(quantityLabel).nth(0).fill('1')
	await page.getByLabel(expenseLabel).nth(1).fill('Taxi XL')
	await page.getByLabel(priceLabel).nth(1).fill('25')
	await page.getByLabel(quantityLabel).nth(1).fill('1')

	const updatedTotal = 50
	const updatedFormatted = formatUsd(updatedTotal)

	await page.getByRole('button', { name: saveButton }).click()
	await expect(page).toHaveURL('/expenses')

	const updatedRow = tbody.getByRole('row').filter({ hasText: updatedFormatted })
	await expect(updatedRow).toBeVisible()
	await expect(tbody.getByRole('row').filter({ hasText: initialFormatted })).toHaveCount(0)

	await updatedRow.getByRole('button', { name: deleteButton }).click()

	const deleteDialog = page.getByRole('alertdialog')
	await expect(deleteDialog).toBeVisible()
	await expect(deleteDialog.getByText(deleteExpenseTitle)).toBeVisible()
	await deleteDialog.getByRole('button', { name: deleteButton }).click()

	await expect(tbody.getByRole('row').filter({ hasText: updatedFormatted })).toHaveCount(0)
})
