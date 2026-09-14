import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { useAuth } from "@/context/auth";
import {
	Breadcrumbs,
	ButtonPrimary,
	Separator,
	Sidebar,
	SidebarTrigger,
	Text,
} from "@/shared/components";
import { Navigation } from "../widgets/navigation";

export function DashboardLayout() {
	const { t } = useTranslation();
	const { logout } = useAuth();

	return (
		<Sidebar
			header={
				<Text size="lg" weight="bold">
					{t("common.brand", { ns: "common" })}
				</Text>
			}
			navigation={<Navigation />}
			footer={<ButtonPrimary onClick={() => logout()}>Logout</ButtonPrimary>}
		>
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<Separator orientation="vertical" />
				<Breadcrumbs />
			</div>
			<div className="px-2 flex flex-col gap-4 mb-4">
				<Outlet />
			</div>
		</Sidebar>
	);
}
