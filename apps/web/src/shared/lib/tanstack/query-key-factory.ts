export const queryKeys = {
	expenses: {
		all: () => ["expenses"] as const,
		single: (id: string) => ["expenses", id] as const,
	},
};
