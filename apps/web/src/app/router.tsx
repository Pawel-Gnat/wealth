import { Route, Routes } from "react-router";
import { AuthPage } from "@/pages/auth";
import { AuthenticatedLayout, UnauthenticatedLayout } from "@/shared/layouts";

export { APP_ROUTES, type AppRoutePath, type AppRoutes } from "./routes";

import { DashboardPage } from "@/pages/dashboard";
import { ExpenseFormPage } from "@/pages/expense-form";
import { ExpensesListPage } from "@/pages/expenses";
import { GroupDocumentsPage } from "@/pages/group";
import { IncomeFormPage } from "@/pages/income-form";
import { IncomesListPage } from "@/pages/incomes";
import { DashboardLayout } from "@/widgets/dashboard-layout";
import { APP_ROUTES, NEW_DOCUMENT_SEGMENT } from "./routes";

export function AppRouter() {
	return (
		<Routes>
			<Route element={<UnauthenticatedLayout />}>
				<Route path={APP_ROUTES.auth} element={<AuthPage />} />
			</Route>
			<Route element={<AuthenticatedLayout />}>
				<Route element={<DashboardLayout />}>
					<Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
					<Route path={APP_ROUTES.incomes.list}>
						<Route index element={<IncomesListPage />} />
						<Route path={NEW_DOCUMENT_SEGMENT} element={<IncomeFormPage />} />
						<Route path=":id" element={<IncomeFormPage />} />
					</Route>
					<Route path={APP_ROUTES.expenses.list}>
						<Route index element={<ExpensesListPage />} />
						<Route path={NEW_DOCUMENT_SEGMENT} element={<ExpenseFormPage />} />
						<Route path=":id" element={<ExpenseFormPage />} />
					</Route>
					<Route path={APP_ROUTES.group.list}>
						<Route index element={<GroupDocumentsPage />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	);
}
