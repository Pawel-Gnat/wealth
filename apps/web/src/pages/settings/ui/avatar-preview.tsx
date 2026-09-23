import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Avatar, Text } from "@/shared/components";

type AvatarPreviewProps = {
	src?: string | null;
	user: User;
};

export const AvatarPreview = ({ src, user }: AvatarPreviewProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-2 flex-col">
			{src ? (
				<img src={src} alt="" className="size-20 rounded-full object-cover" />
			) : (
				<Avatar user={user} size="lg" />
			)}

			<Text size="sm" color="muted">
				{t("profile.change-avatar.description", { ns: "settings" })}
			</Text>
		</div>
	);
};
