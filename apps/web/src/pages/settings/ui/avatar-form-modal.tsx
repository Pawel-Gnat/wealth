import {
	USER_AVATAR_MAX_SIZE_BYTES,
	USER_AVATAR_MAX_SIZE_MB,
	USER_AVATAR_MIME_TYPES,
} from "@repo/api/schemas";
import type { User } from "@repo/api/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormFile, FormModal } from "@/shared/components";
import { useAvatarForm } from "../hooks/use-avatar-form";
import { AvatarPreview } from "./avatar-preview";

type AvatarFormModalProps = {
	user: User;
};

export const AvatarFormModal = ({ user }: AvatarFormModalProps) => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const { control, isPending, updateAvatar, previewSrc, reset } = useAvatarForm(
		{
			onSuccess: () => {
				setOpen(false);
			},
		},
	);

	return (
		<FormModal
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);

				if (!nextOpen) {
					reset();
				}
			}}
			triggerText={t("action.change-avatar", { ns: "common" })}
			triggerIcon="photo"
			title={t("profile.change-avatar.title", { ns: "settings" })}
			onSubmit={updateAvatar}
			submitText={t("action.save", { ns: "common" })}
			isPending={isPending}
		>
			<AvatarPreview src={previewSrc} user={user} />
			<FormFile
				name="avatar"
				accept={Object.fromEntries(
					USER_AVATAR_MIME_TYPES.map((mime) => [mime, []]),
				)}
				maxSize={USER_AVATAR_MAX_SIZE_BYTES}
				control={control}
				label={t("file.label", { ns: "form" })}
				description={t("file.description", {
					ns: "form",
					size: USER_AVATAR_MAX_SIZE_MB,
				})}
				disabled={isPending}
			/>
		</FormModal>
	);
};
