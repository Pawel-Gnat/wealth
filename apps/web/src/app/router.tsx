import { createBrowserRouter } from "react-router";
import { AuthLayout } from "@/pages/auth/layouts";
import {
	AuthenticatedLayout,
	DashboardLayout,
	RootLayout,
	UnauthenticatedLayout,
} from "@/shared/layouts";
import { PageLoader } from "@/shared/widgets/page-loader";
import { lazyPage } from "@/shared/widgets/route-chunk";
import { APP_ROUTES, EDIT_RECORD_SEGMENT, NEW_RECORD_SEGMENT } from "./routes";

export { APP_ROUTES, type AppRoutePath, type AppRoutes } from "./routes";

const authPage = lazyPage(() =>
	import("@/pages/auth").then((module) => module.AuthPage),
);
const dashboardPage = lazyPage(() =>
	import("@/pages/dashboard").then((module) => module.DashboardPage),
);
const recordsListPage = lazyPage(() =>
	import("@/pages/records").then((module) => module.RecordsListPage),
);
const recordFormPage = lazyPage(() =>
	import("@/pages/records/form").then((module) => module.RecordFormPage),
);
const recordPage = lazyPage(() =>
	import("@/pages/records/[id]").then((module) => module.RecordPage),
);
const budgetsPage = lazyPage(() =>
	import("@/pages/budgets").then((module) => module.BudgetsPage),
);
const settingsPage = lazyPage(() =>
	import("@/pages/settings").then((module) => module.SettingsPage),
);

export const router = createBrowserRouter([
	{
		Component: RootLayout,
		hydrateFallbackElement: <PageLoader />,
		children: [
			{
				Component: UnauthenticatedLayout,
				children: [
					{
						Component: AuthLayout,
						children: [{ path: APP_ROUTES.auth, ...authPage }],
					},
				],
			},
			{
				Component: AuthenticatedLayout,
				children: [
					{
						Component: DashboardLayout,
						children: [
							{ path: APP_ROUTES.dashboard, ...dashboardPage },
							{
								path: APP_ROUTES.records.list,
								children: [
									{ index: true, ...recordsListPage },
									{ path: NEW_RECORD_SEGMENT, ...recordFormPage },
									{
										path: ":id",
										children: [
											{ index: true, ...recordPage },
											{ path: EDIT_RECORD_SEGMENT, ...recordFormPage },
										],
									},
								],
							},
							{
								path: APP_ROUTES.budgets.list,
								children: [
									{ index: true, ...budgetsPage },
									{
										path: ":budgetId",
										children: [
											{ index: true, ...recordsListPage },
											{ path: NEW_RECORD_SEGMENT, ...recordFormPage },
											{
												path: ":id",
												children: [
													{ index: true, ...recordPage },
													{ path: EDIT_RECORD_SEGMENT, ...recordFormPage },
												],
											},
										],
									},
								],
							},
							{ path: APP_ROUTES.settings, ...settingsPage },
						],
					},
				],
			},
		],
	},
]);
