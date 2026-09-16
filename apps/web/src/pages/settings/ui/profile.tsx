import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { ButtonSecondary, Card, Icon } from "@/shared/components";
import { UserAvatar } from "./user-avatar";

type ProfileProps = {
	user: User;
};
export const Profile = ({ user }: ProfileProps) => {
	const { t } = useTranslation();

	return (
		<Card
			title={t("profile.title", { ns: "settings" })}
			contentClassName="flex items-center justify-between"
		>
			<UserAvatar user={user} />
			<ButtonSecondary>
				<Icon name="photo" />
				{t("action.change-photo", { ns: "common" })}
			</ButtonSecondary>
		</Card>
	);
};
