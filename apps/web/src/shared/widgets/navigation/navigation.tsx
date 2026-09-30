import { useTranslation } from "react-i18next";
import { APP_ROUTES } from "@/app/routes";
import { Icon, NavLink } from "@/shared/components";

export const Navigation = () => {
	const { t } = useTranslation();

	return (
		<nav className="flex flex-1 flex-col gap-1">
			<NavLink to={APP_ROUTES.dashboard} end>
				<Icon name="dashboard" />
				{t("navigation.dashboard", { ns: "common" })}
			</NavLink>
			<NavLink to={APP_ROUTES.records.list}>
				<Icon name="money" />
				{t("navigation.records", { ns: "common" })}
			</NavLink>
			<NavLink to={APP_ROUTES.group.list}>
				<Icon name="group" />
				{t("navigation.group", { ns: "common" })}
			</NavLink>
			<NavLink to={APP_ROUTES.settings}>
				<Icon name="settings" />
				{t("navigation.settings", { ns: "common" })}
			</NavLink>
		</nav>
	);
};
