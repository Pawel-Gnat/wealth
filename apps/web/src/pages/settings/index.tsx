import { useTranslation } from "react-i18next";
import { PageLayout } from "@/shared/layouts";

export const SettingsPage = () => {
	const { t } = useTranslation();

	return (
		<PageLayout
			title={t("title", { ns: "settings" })}
			subtitle={t("subtitle", { ns: "settings" })}
		>
			test
		</PageLayout>
	);
};
