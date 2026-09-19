import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/components";
import { PhotoFormModal } from "./photo-form-modal";
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
			<PhotoFormModal user={user} />
		</Card>
	);
};
