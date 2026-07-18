import { ensureI18nInit, getI18nText } from './helpers/i18n'
import { expect, test } from './helpers/test'

function formatUsd(amount: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

test('income document lifecycle', async ({ page, loginAsTestUser }) => {
	await ensureI18nInit()
	await loginAsTestUser()

	const incomeLabel = getI18nText('form', 'line-item.income-label')
	const priceLabel = getI18nText('form', 'single-amount.label')
	const quantityLabel = getI18nText('form', 'quantity.label')
	const saveButton = getI18nText('common', 'action.save')
	const createButton = getI18nText('common', 'action.create')
	const addLineButton = getI18nText('common', 'action.add')
	const editButton = getI18nText('common', 'action.edit')
	const deleteButton = getI18nText('common', 'action.delete')
	const createIncomeText = getI18nText('incomes', 'single.title-create')
	const editIncomeText = getI18nText('incomes', 'single.title-edit')
	const deleteIncomeTitle = getI18nText('incomes', 'delete.title')

	await page.goto('/incomes/new')
	await expect(page.getByRole('heading', { name: createIncomeText })).toBeVisible()

	await page.getByLabel(incomeLabel).nth(0).fill('Salary')
	await page.getByLabel(priceLabel).nth(0).fill('10')
	await page.getByLabel(quantityLabel).nth(0).fill('2')

	await page.getByRole('button', { name: addLineButton }).click()

	await page.getByLabel(incomeLabel).nth(1).fill('Bonus')
	await page.getByLabel(priceLabel).nth(1).fill('7')
	await page.getByLabel(quantityLabel).nth(1).fill('3')

	const initialTotal = 10 * 2 + 7 * 3
	const initialFormatted = formatUsd(initialTotal)

	await page.getByRole('button', { name: createButton }).click()
	await expect(page).toHaveURL('/incomes')

	const tbody = page.locator('[data-slot="table-body"]')
	const initialRow = tbody.getByRole('row').filter({ hasText: initialFormatted })
	await expect(initialRow).toBeVisible()

	await initialRow.getByRole('link', { name: editButton }).click()
	await expect(page.getByRole('heading', { name: editIncomeText })).toBeVisible()

	await page.getByLabel(incomeLabel).nth(0).fill('Salary XL')
	await page.getByLabel(priceLabel).nth(0).fill('25')
	await page.getByLabel(quantityLabel).nth(0).fill('1')
	await page.getByLabel(incomeLabel).nth(1).fill('Bonus XL')
	await page.getByLabel(priceLabel).nth(1).fill('25')
	await page.getByLabel(quantityLabel).nth(1).fill('1')

	const updatedTotal = 50
	const updatedFormatted = formatUsd(updatedTotal)

	await page.getByRole('button', { name: saveButton }).click()
	await expect(page).toHaveURL('/incomes')

	const updatedRow = tbody.getByRole('row').filter({ hasText: updatedFormatted })
	await expect(updatedRow).toBeVisible()
	await expect(tbody.getByRole('row').filter({ hasText: initialFormatted })).toHaveCount(0)

	await updatedRow.getByRole('button', { name: deleteButton }).click()

	const deleteDialog = page.getByRole('alertdialog')
	await expect(deleteDialog).toBeVisible()
	await expect(deleteDialog.getByText(deleteIncomeTitle)).toBeVisible()
	await deleteDialog.getByRole('button', { name: deleteButton }).click()

	await expect(tbody.getByRole('row').filter({ hasText: updatedFormatted })).toHaveCount(0)
})
