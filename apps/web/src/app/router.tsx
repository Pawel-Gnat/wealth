import { Route, Routes } from "react-router";
import { AuthenticatedLayout } from "@/app/authenticated-layout";
import { UnauthenticatedLayout } from "@/app/unauthenticated-layout";
import { AuthPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import { ExpenseFormPage, ExpensesListPage } from "@/pages/expenses";
import {
	IncomeAddPage,
	IncomeEditPage,
	IncomesListPage,
} from "@/pages/incomes";
import { DashboardLayout } from "@/widgets/dashboard-layout";

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
		? R extends string
			? R
			: never
		: T extends Record<string, unknown>
			? RoutePathLeaf<T[keyof T]>
			: never;

export type AppRoutePath = RoutePathLeaf<AppRoutes>;

export function AppRoutes() {
	return (
		<Routes>
			<Route element={<UnauthenticatedLayout />}>
				<Route path="/auth" element={<AuthPage />} />
			</Route>
			<Route element={<AuthenticatedLayout />}>
				<Route element={<DashboardLayout />}>
					<Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
					<Route path={APP_ROUTES.incomes.list} element={<IncomesListPage />} />
					<Route path={APP_ROUTES.incomes.add} element={<IncomeAddPage />} />
					<Route
						path={APP_ROUTES.incomes.edit(":id")}
						element={<IncomeEditPage />}
					/>
					<Route
						path={APP_ROUTES.expenses.list}
						element={<ExpensesListPage />}
					/>
					<Route path={APP_ROUTES.expenses.add} element={<ExpenseFormPage />} />
					<Route
						path={APP_ROUTES.expenses.edit(":id")}
						element={<ExpenseFormPage />}
					/>
				</Route>
			</Route>
		</Routes>
	);
}
