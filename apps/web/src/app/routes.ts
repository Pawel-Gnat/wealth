export const NEW_RECORD_SEGMENT = "new" as const;
export const EDIT_RECORD_SEGMENT = "edit" as const;

export const APP_ROUTES = {
	auth: "/auth",
	dashboard: "/",
	records: {
		list: "/records",
		add: `/records/${NEW_RECORD_SEGMENT}`,
		view: (id: string): `/records/${string}` => `/records/${id}`,
		edit: (id: string): `/records/${string}/${typeof EDIT_RECORD_SEGMENT}` =>
			`/records/${id}/${EDIT_RECORD_SEGMENT}`,
	},
	budgets: {
		list: "/budgets",
		add: (
			budgetId: string,
		): `/budgets/${string}/${typeof NEW_RECORD_SEGMENT}` =>
			`/budgets/${budgetId}/${NEW_RECORD_SEGMENT}`,
		view: (budgetId: string): `/budgets/${string}` => `/budgets/${budgetId}`,
		edit: (
			budgetId: string,
			recordId: string,
		): `/budgets/${string}/${string}/${typeof EDIT_RECORD_SEGMENT}` =>
			`/budgets/${budgetId}/${recordId}/${EDIT_RECORD_SEGMENT}`,
		record: (
			budgetId: string,
			recordId: string,
		): `/budgets/${string}/${string}` => `/budgets/${budgetId}/${recordId}`,
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
