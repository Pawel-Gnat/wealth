import { useTranslation } from "react-i18next";
import { useUser } from "@/context/auth";
import { PageLayout } from "@/shared/layouts";
import { Details } from "./ui/details";
import { Password } from "./ui/password";
import { Profile } from "./ui/profile";

export const SettingsPage = () => {
	const { t } = useTranslation();
	const { data: user } = useUser();

	if (!user) return null;

	return (
		<PageLayout
			title={t("title", { ns: "settings" })}
			subtitle={t("subtitle", { ns: "settings" })}
		>
			<Profile user={user} />
			<Details user={user} />
			<Password />
		</PageLayout>
	);
};
