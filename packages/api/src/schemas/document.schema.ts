import { z } from 'zod'
import { apiPaginatedPayload } from './common.schema'

export const expenseDocumentListItemSchema = z.object({
	slug: z.string(),
	date: z.date(),
	totalAmount: z.number(),
})
export type ExpenseDocumentListItem = z.infer<typeof expenseDocumentListItemSchema>

export const expenseDocumentListResponseSchema = apiPaginatedPayload(expenseDocumentListItemSchema)
export type ExpenseDocumentListResponse = z.infer<typeof expenseDocumentListResponseSchema>

export const lineItemSchema = z.object({
	title: z.string(),
	quantity: z.number(),
	singleAmount: z.number(),
})
export type LineItem = z.infer<typeof lineItemSchema>

export const documentCreatePayloadSchema = z.object({
	date: z.date(),
	lineItems: z.array(lineItemSchema),
})
export type DocumentCreatePayload = z.infer<typeof documentCreatePayloadSchema>
