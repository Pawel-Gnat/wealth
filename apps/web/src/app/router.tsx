import { Route, Routes } from "react-router";
import { AuthPage } from "@/pages/auth";
import {
	AuthenticatedLayout,
	DashboardLayout,
	UnauthenticatedLayout,
} from "@/shared/layouts";

export { APP_ROUTES, type AppRoutePath, type AppRoutes } from "./routes";

import { AuthLayout } from "@/pages/auth/layouts";
import { BudgetsPage } from "@/pages/budgets";
import { DashboardPage } from "@/pages/dashboard";
import { RecordsListPage } from "@/pages/records";
import { RecordPage } from "@/pages/records/[id]";
import { RecordFormPage } from "@/pages/records/form";
import { SettingsPage } from "@/pages/settings";
import { APP_ROUTES, EDIT_RECORD_SEGMENT, NEW_RECORD_SEGMENT } from "./routes";

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
					<Route path={APP_ROUTES.records.list}>
						<Route index element={<RecordsListPage />} />
						<Route path={NEW_RECORD_SEGMENT} element={<RecordFormPage />} />
						<Route path=":id">
							<Route index element={<RecordPage />} />
							<Route path={EDIT_RECORD_SEGMENT} element={<RecordFormPage />} />
						</Route>
					</Route>
					<Route path={APP_ROUTES.budgets.list}>
						<Route index element={<BudgetsPage />} />
						<Route path=":budgetId">
							<Route index element={<RecordsListPage />} />
							<Route path={NEW_RECORD_SEGMENT} element={<RecordFormPage />} />
							<Route path=":id">
								<Route index element={<RecordPage />} />
								<Route
									path={EDIT_RECORD_SEGMENT}
									element={<RecordFormPage />}
								/>
							</Route>
						</Route>
					</Route>
					<Route path={APP_ROUTES.settings} element={<SettingsPage />} />
				</Route>
			</Route>
		</Routes>
	);
}
