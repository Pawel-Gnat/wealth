import type { Period } from "@repo/api/schemas";

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
		summary: () => ["dashboard", "summary"] as const,
		cumulativeChart: (days: Period) =>
			["dashboard", "cumulative-chart", days] as const,
		dailyChart: (days: Period) => ["dashboard", "daily-chart", days] as const,
	},
};
