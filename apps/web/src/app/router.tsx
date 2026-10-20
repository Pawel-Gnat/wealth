import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { AuthLayout } from "@/pages/auth/layouts";
import { ErrorPage } from "@/pages/error";
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

const loadAuthPage = lazyPage(() =>
	import("@/pages/auth").then(({ AuthPage }) => AuthPage),
);

const loadDashboardPage = lazyPage(() =>
	import("@/pages/dashboard").then(({ DashboardPage }) => DashboardPage),
);

const loadRecordsListPage = lazyPage(() =>
	import("@/pages/records").then(({ RecordsListPage }) => RecordsListPage),
);

const loadRecordFormPage = lazyPage(() =>
	import("@/pages/records/form").then(({ RecordFormPage }) => RecordFormPage),
);

const loadRecordPage = lazyPage(() =>
	import("@/pages/records/[id]").then(({ RecordPage }) => RecordPage),
);

const loadBudgetsPage = lazyPage(() =>
	import("@/pages/budgets").then(({ BudgetsPage }) => BudgetsPage),
);

const loadSettingsPage = lazyPage(() =>
	import("@/pages/settings").then(({ SettingsPage }) => SettingsPage),
);

const loadNotFoundPage = lazyPage(() =>
	import("@/pages/not-found").then(({ NotFoundPage }) => NotFoundPage),
);

const routes: RouteObject[] = [
	{
		element: <UnauthenticatedLayout />,
		children: [
			{
				element: <AuthLayout />,
				children: [{ path: APP_ROUTES.auth, lazy: loadAuthPage }],
			},
		],
	},
	{
		element: <AuthenticatedLayout />,
		children: [
			{
				element: <DashboardLayout />,
				children: [
					{
						element: <Outlet />,
						errorElement: <ErrorPage />,
						children: [
							{ path: APP_ROUTES.dashboard, lazy: loadDashboardPage },
							{
								path: APP_ROUTES.records.list,
								children: [
									{ index: true, lazy: loadRecordsListPage },
									{ path: NEW_RECORD_SEGMENT, lazy: loadRecordFormPage },
									{
										path: ":id",
										children: [
											{ index: true, lazy: loadRecordPage },
											{ path: EDIT_RECORD_SEGMENT, lazy: loadRecordFormPage },
										],
									},
								],
							},
							{
								path: APP_ROUTES.budgets.list,
								children: [
									{ index: true, lazy: loadBudgetsPage },
									{
										path: ":budgetId",
										children: [
											{ index: true, lazy: loadRecordsListPage },
											{ path: NEW_RECORD_SEGMENT, lazy: loadRecordFormPage },
											{
												path: ":id",
												children: [
													{ index: true, lazy: loadRecordPage },
													{
														path: EDIT_RECORD_SEGMENT,
														lazy: loadRecordFormPage,
													},
												],
											},
										],
									},
								],
							},
							{ path: APP_ROUTES.settings, lazy: loadSettingsPage },
							{ path: "*", lazy: loadNotFoundPage },
						],
					},
				],
			},
		],
	},
];

export const router = createBrowserRouter([
	{
		element: <RootLayout />,
		HydrateFallback: PageLoader,
		children: routes,
	},
]);
