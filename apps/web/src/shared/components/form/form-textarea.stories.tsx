import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormTextarea } from "./form-textarea";
import { FormFieldStory } from "./helpers/form-field-story";

type TitleValues = {
	title: string;
};

const TitleField = ({
	disabled,
	error,
}: {
	disabled?: boolean;
	error?: string;
}) => {
	const { t } = useTranslation();

	return (
		<FormFieldStory<TitleValues>
			defaultValues={{ title: "" }}
			{...(disabled ? { disabled } : {})}
			{...(error ? { error: { name: "title", message: error } } : {})}
		>
			{(control) => (
				<FormTextarea
					name="title"
					label={t("title.label", { ns: "form" })}
					control={control}
				/>
			)}
		</FormFieldStory>
	);
};

const meta = {
	title: "Shared/Form/Textarea",
	component: FormTextarea,
} satisfies Meta<typeof FormTextarea>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {
	render: () => <TitleField />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <TitleField error="form:title.required" />,
};

export const Disabled: Story = {
	render: () => <TitleField disabled />,
};
