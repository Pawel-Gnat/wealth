export const APP_ROUTES = {
	auth: "/auth",
	dashboard: "/",
	incomes: {
		list: "/incomes",
		add: "/incomes/new",
		edit: (id: string): `/incomes/${string}` => `/incomes/${id}`,
	},
	expenses: {
		list: "/expenses",
		add: "/expenses/new",
		edit: (id: string): `/expenses/${string}` => `/expenses/${id}`,
	},
} as const;

export type AppRoutes = typeof APP_ROUTES;

type RoutePathLeaf<T> = T extends string
	? T
	: T extends (...args: never[]) => infer R
		? R
		: T extends Record<string, unknown>
			? RoutePathLeaf<T[keyof T]>
			: never;

export type AppRoutePath = RoutePathLeaf<AppRoutes>;
