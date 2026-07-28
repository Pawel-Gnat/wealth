import { faker } from '@faker-js/faker'
import type { LineItem } from '@repo/api/schemas'

const CREATE_PROBABILITY = 0.75

const EXPENSE_AMOUNT = { min: 5, max: 25 } as const
const INCOME_AMOUNT = { min: 10, max: 100 } as const
const EXPENSE_MAX_QUANTITY = 7
const INCOME_MAX_QUANTITY = 3

export const shouldCreateDocument = (): boolean => Math.random() < CREATE_PROBABILITY
export const createExpensePayload = (): LineItem => createDocumentPayload(EXPENSE_AMOUNT, EXPENSE_MAX_QUANTITY)
export const createIncomePayload = (): LineItem => createDocumentPayload(INCOME_AMOUNT, INCOME_MAX_QUANTITY)

const createDocumentPayload = (amountRange: { min: number; max: number }, maxQuantity: number): LineItem => {
	const singleAmount = roundToTwoDecimals(
		faker.number.float({
			min: amountRange.min,
			max: amountRange.max,
			fractionDigits: 2,
		}),
	)

	return {
		title: createDocumentTitle(),
		singleAmount,
		quantity: createQuantity(singleAmount, amountRange, maxQuantity),
	}
}

const createQuantity = (
	singleAmount: number,
	amountRange: { min: number; max: number },
	maxQuantity: number,
): number => {
	const span = amountRange.max - amountRange.min
	const normalized = span === 0 ? 0 : (singleAmount - amountRange.min) / span
	const baseQuantity = Math.round(maxQuantity - normalized * (maxQuantity - 1))
	const jitter = faker.number.int({ min: -1, max: 1 })

	return Math.min(maxQuantity, Math.max(1, baseQuantity + jitter))
}

const createDocumentTitle = (): string => faker.word.words({ count: { min: 1, max: 4 } })

const roundToTwoDecimals = (value: number): number => Math.round(value * 100) / 100
