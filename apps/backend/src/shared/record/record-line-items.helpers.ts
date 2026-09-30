import type { RecordCreatePayload } from "@repo/api/types";

export function calculateRecordTotalAmount(
	payload: RecordCreatePayload,
): number {
	return payload.lineItems.reduce(
		(sum, item) => sum + item.quantity * item.singleAmount,
		0,
	);
}

export type RecordLineItemInsertRow = {
	title: string;
	quantity: number;
	singleAmount: string;
};

export function mapPayloadLineItemsToInsertRows(
	payload: RecordCreatePayload,
): RecordLineItemInsertRow[] {
	return payload.lineItems.map((lineItem) => ({
		title: lineItem.title,
		quantity: lineItem.quantity,
		singleAmount: lineItem.singleAmount.toFixed(2),
	}));
}
