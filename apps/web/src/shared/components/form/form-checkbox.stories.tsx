import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormCheckbox } from "./form-checkbox";
import { FormFieldStory } from "./helpers/form-field-story";

type AcceptedValues = {
	accepted: boolean;
};

const AcceptedField = ({
	disabled,
	error,
}: {
	disabled?: boolean;
	error?: string;
}) => {
	const { t } = useTranslation();

	return (
		<FormFieldStory<AcceptedValues>
			defaultValues={{ accepted: false }}
			{...(disabled ? { disabled } : {})}
			{...(error ? { error: { name: "accepted", message: error } } : {})}
		>
			{(control) => (
				<FormCheckbox
					name="accepted"
					label={t("action.accept", { ns: "common" })}
					control={control}
				/>
			)}
		</FormFieldStory>
	);
};

const meta = {
	title: "Shared/Form/Checkbox",
	component: FormCheckbox,
} satisfies Meta<typeof FormCheckbox>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {
	render: () => <AcceptedField />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <AcceptedField error="form:title.required" />,
};

export const Disabled: Story = {
	render: () => <AcceptedField disabled />,
};
