import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormDatePicker } from "./form-date-picker";
import { FormFieldStory } from "./helpers/form-field-story";

const storyDate = new Date(2024, 2, 1);

type DateValues = {
	date: Date;
};

const DateField = ({
	disabled,
	error,
}: {
	disabled?: boolean;
	error?: string;
}) => {
	const { t } = useTranslation();

	return (
		<FormFieldStory<DateValues>
			defaultValues={{ date: storyDate }}
			{...(disabled ? { disabled } : {})}
			{...(error ? { error: { name: "date", message: error } } : {})}
		>
			{(control) => (
				<FormDatePicker
					name="date"
					label={t("date.label", { ns: "form" })}
					control={control}
				/>
			)}
		</FormFieldStory>
	);
};

const meta = {
	title: "Shared/Form/Date picker",
	component: FormDatePicker,
} satisfies Meta<typeof FormDatePicker>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {
	render: () => <DateField />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <DateField error="form:title.required" />,
};

export const Disabled: Story = {
	render: () => <DateField disabled />,
};
