import { Route, Routes } from "react-router";
import { AuthPage } from "@/pages/auth";
import {
	AuthenticatedLayout,
	DashboardLayout,
	UnauthenticatedLayout,
} from "@/shared/layouts";

export { APP_ROUTES, type AppRoutePath, type AppRoutes } from "./routes";

import { AuthLayout } from "@/pages/auth/layouts";
import { DashboardPage } from "@/pages/dashboard";
import { ExpensePage } from "@/pages/expense";
import { ExpenseFormPage } from "@/pages/expense-form";
import { ExpensesListPage } from "@/pages/expenses";
import { GroupDocumentsPage } from "@/pages/group";
import { IncomePage } from "@/pages/income";
import { IncomeFormPage } from "@/pages/income-form";
import { IncomesListPage } from "@/pages/incomes";
import { SettingsPage } from "@/pages/settings";
import {
	APP_ROUTES,
	EDIT_DOCUMENT_SEGMENT,
	NEW_DOCUMENT_SEGMENT,
} from "./routes";

export function AppRouter() {
	return (
		<Routes>
			<Route element={<UnauthenticatedLayout />}>
				<Route element={<AuthLayout />}>
					<Route path={APP_ROUTES.auth} element={<AuthPage />} />
				</Route>
			</Route>
			<Route element={<AuthenticatedLayout />}>
				<Route element={<DashboardLayout />}>
					<Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
					<Route path={APP_ROUTES.incomes.list}>
						<Route index element={<IncomesListPage />} />
						<Route path={NEW_DOCUMENT_SEGMENT} element={<IncomeFormPage />} />
						<Route path=":id">
							<Route index element={<IncomePage />} />
							<Route
								path={EDIT_DOCUMENT_SEGMENT}
								element={<IncomeFormPage />}
							/>
						</Route>
					</Route>
					<Route path={APP_ROUTES.expenses.list}>
						<Route index element={<ExpensesListPage />} />
						<Route path={NEW_DOCUMENT_SEGMENT} element={<ExpenseFormPage />} />
						<Route path=":id">
							<Route index element={<ExpensePage />} />
							<Route
								path={EDIT_DOCUMENT_SEGMENT}
								element={<ExpenseFormPage />}
							/>
						</Route>
					</Route>
					<Route path={APP_ROUTES.group.list}>
						<Route index element={<GroupDocumentsPage />} />
					</Route>
					<Route path={APP_ROUTES.settings} element={<SettingsPage />} />
				</Route>
			</Route>
		</Routes>
	);
}
