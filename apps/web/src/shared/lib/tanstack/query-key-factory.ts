import type { Period, RecordKind } from "@repo/api/types";

export const queryKeys = {
	me: () => ["me"] as const,
	records: {
		all: () => ["records"] as const,
		single: (id: string) => ["records", id] as const,
	},
	budgets: {
		all: () => ["budgets"] as const,
		invites: () => ["budgets", "invites"] as const,
		documents: (id: string, kind?: RecordKind) =>
			["budgets", id, "documents", kind ?? "all"] as const,
	},
	users: {
		search: (query: string) => ["users", "search", query] as const,
	},
	dashboard: {
		all: () => ["dashboard"] as const,
		summary: (days: Period) => ["dashboard", "summary", days] as const,
		cumulativeChart: (days: Period) =>
			["dashboard", "cumulative-chart", days] as const,
		dailyChart: (days: Period) => ["dashboard", "daily-chart", days] as const,
	},
};
