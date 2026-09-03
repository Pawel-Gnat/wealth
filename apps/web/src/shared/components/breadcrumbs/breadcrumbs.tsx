import { I18N_RESOURCES } from "@repo/common/i18n";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { APP_ROUTES, NEW_DOCUMENT_SEGMENT } from "@/app/routes";
import {
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	Breadcrumb as BreadcrumbUI,
} from "@/shared/lib/ui/breadcrumb";

type NavigationSegment =
	keyof (typeof I18N_RESOURCES)["en"]["common"]["navigation"];

const isNavigationSegment = (segment: string): segment is NavigationSegment =>
	Object.hasOwn(I18N_RESOURCES.en.common.navigation, segment);

export const Breadcrumbs = () => {
	const { pathname } = useLocation();
	const { t } = useTranslation();

	const segments = pathname.split("/").filter(Boolean);

	const breadcrumbItems = [
		{
			to: APP_ROUTES.dashboard,
			label: t("navigation.dashboard", { ns: "common" }),
		},
		...segments.map((segment, index) => {
			const to = `/${segments.slice(0, index + 1).join("/")}`;

			return {
				to,
				label: isNavigationSegment(segment)
					? t(`navigation.${segment}`, { ns: "common" })
					: t(segment === NEW_DOCUMENT_SEGMENT ? "action.add" : "action.edit", {
							ns: "common",
						}),
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
