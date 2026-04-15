export const ROUTES = {
	auth: "/auth",
	dashboard: "/",
	incomes: {
		list: "/incomes",
		add: "/incomes/add",
		edit: (id: string) => `/incomes/${id}`,
	},
	expenses: {
		list: "/expenses",
		add: "/expenses/add",
		edit: (id: string) => `/expenses/${id}`,
	},
} as const;
