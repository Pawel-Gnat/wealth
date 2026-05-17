import type { DocumentCreatePayload } from "@repo/api/schemas";

export const DEFAULT_DOCUMENT_VALUES: DocumentCreatePayload = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

export const EMPTY_LINE_ITEM: DocumentCreatePayload["lineItems"][number] = {
	title: "",
	singleAmount: 1,
	quantity: 1,
};

export function calculateLineTotal(
	singleAmount: number | undefined,
	quantity: number | undefined,
): number {
	return (singleAmount ?? 0) * (quantity ?? 1);
}

export function calculateDocumentTotal(
	lineItems: Pick<
		DocumentCreatePayload["lineItems"][number],
		"singleAmount" | "quantity"
	>[],
): number {
	return lineItems.reduce(
		(sum, item) => sum + item.singleAmount * item.quantity,
		0,
	);
}
