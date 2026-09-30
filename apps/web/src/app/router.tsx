import { Route, Routes } from "react-router";
import { AuthPage } from "@/pages/auth";
import {
	AuthenticatedLayout,
	DashboardLayout,
	UnauthenticatedLayout,
} from "@/shared/layouts";

export { APP_ROUTES, type AppRoutePath, type AppRoutes } from "./routes";

import { AuthLayout } from "@/pages/auth/layouts";
import { BudgetPage } from "@/pages/budget";
import { DashboardPage } from "@/pages/dashboard";
import { GroupDocumentsPage } from "@/pages/group";
import { RecordPage } from "@/pages/record";
import { RecordFormPage } from "@/pages/record-form";
import { RecordsListPage } from "@/pages/records";
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
					<Route path={APP_ROUTES.group.list}>
						<Route index element={<GroupDocumentsPage />} />
						<Route path=":id" element={<BudgetPage />} />
					</Route>
					<Route path={APP_ROUTES.settings} element={<SettingsPage />} />
				</Route>
			</Route>
		</Routes>
	);
}
