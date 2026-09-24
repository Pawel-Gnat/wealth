export const NEW_DOCUMENT_SEGMENT = "new" as const;
export const EDIT_DOCUMENT_SEGMENT = "edit" as const;

export const APP_ROUTES = {
	auth: "/auth",
	dashboard: "/",
	incomes: {
		list: "/incomes",
		add: `/incomes/${NEW_DOCUMENT_SEGMENT}`,
		view: (id: string): `/incomes/${string}` => `/incomes/${id}`,
		edit: (id: string): `/incomes/${string}/${typeof EDIT_DOCUMENT_SEGMENT}` =>
			`/incomes/${id}/${EDIT_DOCUMENT_SEGMENT}`,
	},
	expenses: {
		list: "/expenses",
		add: `/expenses/${NEW_DOCUMENT_SEGMENT}`,
		view: (id: string): `/expenses/${string}` => `/expenses/${id}`,
		edit: (id: string): `/expenses/${string}/${typeof EDIT_DOCUMENT_SEGMENT}` =>
			`/expenses/${id}/${EDIT_DOCUMENT_SEGMENT}`,
	},
	group: {
		list: "/group",
	},
	settings: "/settings",
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
