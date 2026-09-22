import type { Period } from "@repo/api/types";

export const queryKeys = {
	me: () => ["me"] as const,
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
		summary: (days: Period) => ["dashboard", "summary", days] as const,
		cumulativeChart: (days: Period) =>
			["dashboard", "cumulative-chart", days] as const,
		dailyChart: (days: Period) => ["dashboard", "daily-chart", days] as const,
	},
};
