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
	group: {
		list: "/group",
		view: (id: string): `/group/${string}` => `/group/${id}`,
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
