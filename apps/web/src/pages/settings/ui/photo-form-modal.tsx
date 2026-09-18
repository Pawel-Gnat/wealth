import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { FormFile, FormModal } from "@/shared/components";
import { usePhotoForm } from "../hooks/use-photo-form";
import { PhotoPreview } from "./photo-preview";

type PhotoFormModalProps = {
	user: User;
};

export const PhotoFormModal = ({ user }: PhotoFormModalProps) => {
	const { t } = useTranslation();
	const { control, isLoading, updatePhoto, previewSrc, maxSizeMb, maxSize } =
		usePhotoForm();

	return (
		<FormModal
			triggerText={t("action.change-photo", { ns: "common" })}
			triggerIcon="photo"
			title={t("profile.change-photo.title", { ns: "settings" })}
			onSubmit={updatePhoto}
			submitText={t("action.save", { ns: "common" })}
			isLoading={isLoading}
		>
			<PhotoPreview src={previewSrc} user={user} />
			<FormFile
				name="photo"
				control={control}
				label={t("file.label", { ns: "form" })}
				description={t("file.description", { ns: "form", size: maxSizeMb })}
				maxSize={maxSize}
			/>
		</FormModal>
	);
};
