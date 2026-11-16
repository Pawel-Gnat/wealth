import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormInput } from "./form-input";
import { FormFieldStory } from "./helpers/form-field-story";

type EmailValues = {
	email: string;
};

const EmailField = ({
	disabled,
	error,
}: {
	disabled?: boolean;
	error?: string;
}) => {
	const { t } = useTranslation();

	return (
		<FormFieldStory<EmailValues>
			defaultValues={{ email: "" }}
			{...(disabled ? { disabled } : {})}
			{...(error ? { error: { name: "email", message: error } } : {})}
		>
			{(control) => (
				<FormInput
					name="email"
					label={t("email.label", { ns: "form" })}
					placeholder={t("email.placeholder", { ns: "form" })}
					control={control}
				/>
			)}
		</FormFieldStory>
	);
};

const meta = {
	title: "Shared/Form/Input",
	component: FormInput,
} satisfies Meta<typeof FormInput>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {
	render: () => <EmailField />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <EmailField error="form:email.invalid" />,
};

export const Disabled: Story = {
	render: () => <EmailField disabled />,
};
