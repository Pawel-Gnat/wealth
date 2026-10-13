import type { RecordCreatePayload } from "@repo/api/types";

export const calculateLineTotal = (
	singleAmount: number | undefined,
	quantity: number | undefined,
) => {
	return (singleAmount ?? 0) * (quantity ?? 1);
};

export const calculateRecordTotal = (
	lineItems: Pick<
		RecordCreatePayload["lineItems"][number],
		"singleAmount" | "quantity"
	>[],
) => {
	return lineItems.reduce(
		(sum, item) => sum + item.singleAmount * item.quantity,
		0,
	);
};
