import type { Page } from '@playwright/test'
import type { RecordCreatePayload, RecordKind } from '@repo/api/types'
import { ensureI18nInit, getI18nText } from '../helpers/i18n'
import { expect } from '../helpers/test'

type CreateLineItem = RecordCreatePayload['lineItems'][number]

export const createExpenseDocument = async (page: Page, payload: CreateLineItem) => {
	await createDocument(page, {
		kind: 'expense',
		payload,
	})
}

export const createIncomeDocument = async (page: Page, payload: CreateLineItem) => {
	await createDocument(page, {
		kind: 'income',
		payload,
	})
}

const createDocument = async (
	page: Page,
	input: {
		kind: RecordKind
		payload: CreateLineItem
	},
) => {
	await ensureI18nInit()

	const priceLabel = getI18nText('form', 'single-amount.label')
	const quantityLabel = getI18nText('form', 'quantity.label')
	const createButton = getI18nText('common', 'action.create')
	const heading = getI18nText('records', 'single.title-create')
	const typeLabel = getI18nText('records', 'single.type')
	const lineItemLabel = getI18nText(
		'form',
		input.kind === 'expense' ? 'line-item.expense-label' : 'line-item.income-label',
	)

	await page.goto('/records/new')
	await expect(page.getByRole('heading', { name: heading })).toBeVisible()

	await page.getByLabel(typeLabel).click()
	await page.getByRole('option', { name: input.kind, exact: true }).click()

	await page.getByLabel(lineItemLabel).nth(0).fill(input.payload.title)
	await page.getByLabel(priceLabel).nth(0).fill(input.payload.singleAmount.toFixed(2))
	await page.getByLabel(quantityLabel).nth(0).fill(String(input.payload.quantity))

	await page.getByRole('button', { name: createButton }).click()
	await expect(page).toHaveURL('/records')
}
