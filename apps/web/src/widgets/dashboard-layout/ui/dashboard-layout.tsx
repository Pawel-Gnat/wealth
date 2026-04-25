import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { APP_ROUTES } from "@/app/router";
import { useAuth } from "@/context/auth";
import { ButtonPrimary, NavLink, Text } from "@/shared/components";

export function DashboardLayout() {
	const { logout } = useAuth();
	const { t } = useTranslation();

	return (
		<div className="flex h-full w-full">
			<aside className="flex w-56 shrink-0 flex-col border-r bg-card p-4 gap-6">
				<Text size="lg" weight="bold">
					Wealth
				</Text>
				<nav className="flex flex-1 flex-col gap-1">
					<NavLink to={APP_ROUTES.dashboard} end>
						{t("navigation.dashboard", { ns: "common" })}
					</NavLink>
					<NavLink to={APP_ROUTES.incomes.list}>
						{t("navigation.incomes", { ns: "common" })}
					</NavLink>
					<NavLink to={APP_ROUTES.expenses.list}>
						{t("navigation.expenses", { ns: "common" })}
					</NavLink>
				</nav>

				<ButtonPrimary onClick={() => logout()}>
					{t("action.logout", { ns: "common" })}
				</ButtonPrimary>
			</aside>
			<div className="min-w-0 flex-1 p-6">
				<Outlet />
			</div>
		</div>
	);
}
