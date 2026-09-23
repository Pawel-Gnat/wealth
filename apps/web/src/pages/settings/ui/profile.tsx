import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/components";
import { UserAvatar } from "@/shared/widgets/user-avatar";
import { AvatarFormModal } from "./avatar-form-modal";

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
			<UserAvatar user={user} size="lg" showUserName />
			<AvatarFormModal user={user} />
		</Card>
	);
};
