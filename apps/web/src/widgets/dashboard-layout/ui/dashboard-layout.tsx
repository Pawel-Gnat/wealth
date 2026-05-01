import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { APP_ROUTES } from "@/app/router";
import { useAuth } from "@/context/auth";
import {
	Breadcrumbs,
	ButtonPrimary,
	Icon,
	NavLink,
	Separator,
	Text,
} from "@/shared/components";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/shared/lib/ui/sidebar";

export function DashboardLayout() {
	const { logout } = useAuth();
	const { t } = useTranslation();

	return (
		<SidebarProvider>
			<aside>
				<Sidebar>
					<SidebarHeader>
						<Text size="lg" weight="bold">
							Wealth
						</Text>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<nav className="flex flex-1 flex-col gap-1">
								<NavLink to={APP_ROUTES.dashboard} end>
									<Icon name="dashboard" />
									{t("navigation.dashboard", { ns: "common" })}
								</NavLink>
								<NavLink to={APP_ROUTES.incomes.list}>
									<Icon name="income" />
									{t("navigation.incomes", { ns: "common" })}
								</NavLink>
								<NavLink to={APP_ROUTES.expenses.list}>
									<Icon name="expense" />
									{t("navigation.expenses", { ns: "common" })}
								</NavLink>
							</nav>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						<ButtonPrimary onClick={() => logout()}>
							<Icon name="logout" />
							{t("action.logout", { ns: "common" })}
						</ButtonPrimary>
					</SidebarFooter>
				</Sidebar>
			</aside>
			<SidebarInset className="p-2 flex flex-col gap-6">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<Separator orientation="vertical" />
					<Breadcrumbs />
				</div>
				<div className="px-2 flex flex-col gap-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
