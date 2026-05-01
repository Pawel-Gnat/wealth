import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { APP_ROUTES } from "@/app/router";
import {
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	Breadcrumb as BreadcrumbUI,
} from "@/shared/lib/ui/breadcrumb";

export const Breadcrumbs = () => {
	const { pathname } = useLocation();
	const { t } = useTranslation();

	const segments = pathname.split("/").filter(Boolean);
	const segmentPaths = segments.map(
		(_, index) => `/${segments.slice(0, index + 1).join("/")}`,
	);

	const breadcrumbItems = [
		{
			to: APP_ROUTES.dashboard,
			label: t("navigation.dashboard", { ns: "common" }),
		},
		...segmentPaths.map((path) => {
			if (path === APP_ROUTES.incomes.list) {
				return {
					to: APP_ROUTES.incomes.list,
					label: t("navigation.incomes", { ns: "common" }),
				};
			}

			if (path === APP_ROUTES.incomes.add) {
				return {
					to: APP_ROUTES.incomes.add,
					label: "Add",
				};
			}

			if (path.startsWith("/incomes/")) {
				return {
					to: path,
					label: "Details",
				};
			}

			if (path === APP_ROUTES.expenses.list) {
				return {
					to: APP_ROUTES.expenses.list,
					label: t("navigation.expenses", { ns: "common" }),
				};
			}

			if (path === APP_ROUTES.expenses.add) {
				return {
					to: APP_ROUTES.expenses.add,
					label: "Add",
				};
			}

			if (path.startsWith("/expenses/")) {
				return {
					to: path,
					label: "Details",
				};
			}

			return {
				to: path,
				label: segments[segmentPaths.indexOf(path)] ?? path,
			};
		}),
	];

	return (
		<BreadcrumbUI>
			<BreadcrumbList>
				{breadcrumbItems.map((item, index) => {
					const isLast = index === breadcrumbItems.length - 1;

					return (
						<Fragment key={item.to}>
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link to={item.to}>{item.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast ? <BreadcrumbSeparator /> : null}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</BreadcrumbUI>
	);
};
