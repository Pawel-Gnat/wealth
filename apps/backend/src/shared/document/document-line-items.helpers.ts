import type { DocumentCreatePayload } from "@repo/api/schemas";

export function calculateDocumentTotalAmount(
	payload: DocumentCreatePayload,
): number {
	return payload.lineItems.reduce(
		(sum, item) => sum + item.quantity * item.singleAmount,
		0,
	);
}

export type DocumentLineItemInsertRow = {
	title: string;
	quantity: number;
	singleAmount: string;
};

export function mapPayloadLineItemsToInsertRows(
	payload: DocumentCreatePayload,
): DocumentLineItemInsertRow[] {
	return payload.lineItems.map((lineItem) => ({
		title: lineItem.title,
		quantity: lineItem.quantity,
		singleAmount: lineItem.singleAmount.toFixed(2),
	}));
}
