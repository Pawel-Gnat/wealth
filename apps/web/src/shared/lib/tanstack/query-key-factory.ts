import type { ChartPeriod } from "@repo/api/schemas";

export const queryKeys = {
	expenses: {
		all: () => ["expenses"] as const,
		single: (id: string) => ["expenses", id] as const,
	},
	incomes: {
		all: () => ["incomes"] as const,
		single: (id: string) => ["incomes", id] as const,
	},
	dashboard: {
		all: () => ["dashboard"] as const,
		widgets: () => ["dashboard", "widgets"] as const,
		chart: (period: ChartPeriod) => ["dashboard", "chart", period] as const,
	},
};
