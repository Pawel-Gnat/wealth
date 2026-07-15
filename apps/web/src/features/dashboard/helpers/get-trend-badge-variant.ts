import type { DashboardWidgetKind } from "@repo/api/schemas";
import type { TrendBadgeVariant } from "@/shared/components/badge";

export const getTrendBadgeVariant = (
	kind: DashboardWidgetKind,
	percentChange: number,
): TrendBadgeVariant => {
	const isIncrease = percentChange > 0;

	switch (kind) {
		case "expenses":
			return isIncrease ? "negative" : "positive";
		case "incomes":
		case "netBalance":
			return isIncrease ? "positive" : "negative";
	}
};
