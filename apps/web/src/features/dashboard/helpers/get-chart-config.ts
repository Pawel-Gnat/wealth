import type { TFunction } from "i18next";
import type { ChartConfig } from "@/shared/lib/ui/chart";

export const getChartConfig = (t: TFunction): ChartConfig => ({
	expensesCumulative: {
		label: t("common.expenses", { ns: "common" }),
		color: "var(--destructive)",
	},
	incomesCumulative: {
		label: t("common.incomes", { ns: "common" }),
		color: "var(--success)",
	},
});
