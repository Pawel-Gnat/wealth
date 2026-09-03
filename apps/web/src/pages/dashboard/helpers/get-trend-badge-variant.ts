import type { SummaryKind } from "@repo/api/schemas";
import type { TrendBadgeVariant } from "@/shared/components/badge";

export const getTrendBadgeVariant = (
	kind: SummaryKind,
	percentChange: number,
): TrendBadgeVariant => {
	if (percentChange === 0) {
		return "neutral";
	}

	const isIncrease = percentChange > 0;

	switch (kind) {
		case "expenses":
			return isIncrease ? "negative" : "positive";
		case "incomes":
		case "netBalance":
			return isIncrease ? "positive" : "negative";
	}
};
