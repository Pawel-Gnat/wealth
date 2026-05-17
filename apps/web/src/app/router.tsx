import { Route, Routes } from "react-router";
import { AuthenticatedLayout } from "@/app/authenticated-layout";
import { UnauthenticatedLayout } from "@/app/unauthenticated-layout";
import { AuthPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import { ExpenseFormPage, ExpensesListPage } from "@/pages/expenses";
import { IncomeFormPage, IncomesListPage } from "@/pages/incomes";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export { APP_ROUTES, type AppRoutePath, type AppRoutes } from "./routes";

import { APP_ROUTES } from "./routes";

export function AppRouter() {
	return (
		<Routes>
			<Route element={<UnauthenticatedLayout />}>
				<Route path={APP_ROUTES.auth} element={<AuthPage />} />
			</Route>
			<Route element={<AuthenticatedLayout />}>
				<Route element={<DashboardLayout />}>
					<Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
					<Route path={APP_ROUTES.incomes.list} element={<IncomesListPage />} />
					<Route path={APP_ROUTES.incomes.add} element={<IncomeFormPage />} />
					<Route
						path={APP_ROUTES.incomes.edit(":id")}
						element={<IncomeFormPage />}
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
