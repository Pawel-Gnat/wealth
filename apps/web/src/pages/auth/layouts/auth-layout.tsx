import { periodValues } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { Heading, Icon, Text } from "@/shared/components";

const FEATURE_KEYS = ["personal", "shared", "overview"] as const;

export const AuthLayout = () => {
	const { t, i18n } = useTranslation();
	const periods = new Intl.ListFormat(i18n.language, {
		type: "disjunction",
	}).format(periodValues.map(String));

	return (
		<div className="flex min-h-svh w-full">
			<aside className="bg-primary hidden w-1/3 flex-col justify-between px-6 py-10 lg:flex xl:px-10 xl:py-16">
				<div className="flex max-w-md flex-col gap-6">
					<Heading>{t("common.brand", { ns: "common" })}</Heading>
					<div className="flex flex-col gap-1">
						<Text className="text-2xl leading-tight xl:text-3xl" weight="bold">
							{t("layout.title", { ns: "auth" })}
						</Text>
						<Text>{t("layout.description", { ns: "auth" })}</Text>
					</div>
				</div>
				<ul className="flex flex-col gap-3">
					{FEATURE_KEYS.map((key) => (
						<li key={key} className="flex items-center gap-2">
							<Icon name="accept" />
							<Text size="sm">
								{t(`layout.features.${key}`, { ns: "auth", periods })}
							</Text>
						</li>
					))}
				</ul>
			</aside>
			<main className="bg-background flex flex-1 items-center justify-center p-4 md:p-6">
				<Outlet />
			</main>
		</div>
	);
};
