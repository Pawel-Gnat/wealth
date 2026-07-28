import type { LineItem } from '@repo/api/schemas'
import type { Page } from '@playwright/test'
import { ensureI18nInit, getI18nText } from '../helpers/i18n'
import { expect } from '../helpers/test'

export const createExpenseDocument = async (page: Page, payload: LineItem) => {
	await createDocument(page, {
		path: '/expenses/new',
		listPath: '/expenses',
		heading: getI18nText('expenses', 'single.title-create'),
		lineItemLabel: getI18nText('form', 'line-item.expense-label'),
		payload,
	})
}

export const createIncomeDocument = async (page: Page, payload: LineItem) => {
	await createDocument(page, {
		path: '/incomes/new',
		listPath: '/incomes',
		heading: getI18nText('incomes', 'single.title-create'),
		lineItemLabel: getI18nText('form', 'line-item.income-label'),
		payload,
	})
}

const createDocument = async (
	page: Page,
	input: {
		path: string
		listPath: string
		heading: string
		lineItemLabel: string
		payload: LineItem
	},
) => {
	await ensureI18nInit()

	const priceLabel = getI18nText('form', 'single-amount.label')
	const quantityLabel = getI18nText('form', 'quantity.label')
	const createButton = getI18nText('common', 'action.create')

	await page.goto(input.path)
	await expect(page.getByRole('heading', { name: input.heading })).toBeVisible()

	await page.getByLabel(input.lineItemLabel).nth(0).fill(input.payload.title)
	await page.getByLabel(priceLabel).nth(0).fill(input.payload.singleAmount.toFixed(2))
	await page.getByLabel(quantityLabel).nth(0).fill(String(input.payload.quantity))

	await page.getByRole('button', { name: createButton }).click()
	await expect(page).toHaveURL(input.listPath)
}
