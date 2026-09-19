import {
	USER_PHOTO_MAX_SIZE_BYTES,
	USER_PHOTO_MAX_SIZE_MB,
	USER_PHOTO_MIME_TYPES,
} from "@repo/api/schemas";
import type { User } from "@repo/api/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormFile, FormModal } from "@/shared/components";
import { usePhotoForm } from "../hooks/use-photo-form";
import { PhotoPreview } from "./photo-preview";

type PhotoFormModalProps = {
	user: User;
};

export const PhotoFormModal = ({ user }: PhotoFormModalProps) => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const { control, isPending, updatePhoto, previewSrc, reset } = usePhotoForm({
		onSuccess: () => {
			setOpen(false);
		},
	});

	return (
		<FormModal
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);

				if (!nextOpen) {
					reset();
				}
			}}
			triggerText={t("action.change-photo", { ns: "common" })}
			triggerIcon="photo"
			title={t("profile.change-photo.title", { ns: "settings" })}
			onSubmit={updatePhoto}
			submitText={t("action.save", { ns: "common" })}
			isPending={isPending}
		>
			<PhotoPreview src={previewSrc} user={user} />
			<FormFile
				name="photo"
				accept={Object.fromEntries(
					USER_PHOTO_MIME_TYPES.map((mime) => [mime, []]),
				)}
				maxSize={USER_PHOTO_MAX_SIZE_BYTES}
				control={control}
				label={t("file.label", { ns: "form" })}
				description={t("file.description", {
					ns: "form",
					size: USER_PHOTO_MAX_SIZE_MB,
				})}
				disabled={isPending}
			/>
		</FormModal>
	);
};
