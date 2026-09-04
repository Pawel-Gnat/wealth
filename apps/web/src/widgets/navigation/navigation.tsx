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
			<NavLink to={APP_ROUTES.incomes.list}>
				<Icon name="income" />
				{t("navigation.incomes", { ns: "common" })}
			</NavLink>
			<NavLink to={APP_ROUTES.expenses.list}>
				<Icon name="expense" />
				{t("navigation.expenses", { ns: "common" })}
			</NavLink>
			<NavLink to={APP_ROUTES.group.list}>
				<Icon name="group" />
				{t("navigation.group", { ns: "common" })}
			</NavLink>
		</nav>
	);
};
