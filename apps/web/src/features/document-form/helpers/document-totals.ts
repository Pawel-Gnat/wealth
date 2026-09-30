import type { RecordCreatePayload } from "@repo/api/types";

export function calculateLineTotal(
	singleAmount: number | undefined,
	quantity: number | undefined,
): number {
	return (singleAmount ?? 0) * (quantity ?? 1);
}

export function calculateDocumentTotal(
	lineItems: Pick<
		RecordCreatePayload["lineItems"][number],
		"singleAmount" | "quantity"
	>[],
): number {
	return lineItems.reduce(
		(sum, item) => sum + item.singleAmount * item.quantity,
		0,
	);
}
