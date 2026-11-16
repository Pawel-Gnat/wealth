import {
	USER_AVATAR_MAX_SIZE_BYTES,
	USER_AVATAR_MAX_SIZE_MB,
	USER_AVATAR_MIME_TYPES,
} from "@repo/api/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormFile } from "./form-file";
import { FormFieldStory } from "./helpers/form-field-story";

type AvatarValues = {
	avatar: File | null;
};

const accept = Object.fromEntries(
	USER_AVATAR_MIME_TYPES.map((mime) => [mime, [] as string[]]),
);

const FileField = ({
	disabled,
	error,
}: {
	disabled: boolean;
	error?: string;
}) => {
	const { t } = useTranslation();

	return (
		<FormFieldStory<AvatarValues>
			defaultValues={{ avatar: null }}
			{...(error ? { error: { name: "avatar", message: error } } : {})}
		>
			{(control) => (
				<FormFile
					name="avatar"
					control={control}
					accept={accept}
					maxSize={USER_AVATAR_MAX_SIZE_BYTES}
					disabled={disabled}
					label={t("file.label", { ns: "form" })}
					description={t("file.description", {
						ns: "form",
						size: USER_AVATAR_MAX_SIZE_MB,
					})}
				/>
			)}
		</FormFieldStory>
	);
};

const meta = {
	title: "Shared/Form/File",
	component: FormFile,
} satisfies Meta<typeof FormFile>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {
	render: () => <FileField disabled={false} />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <FileField disabled={false} error="form:file.required" />,
};

export const Disabled: Story = {
	render: () => <FileField disabled />,
};
