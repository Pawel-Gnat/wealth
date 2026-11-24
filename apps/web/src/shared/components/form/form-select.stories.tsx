import { recordTypes } from "@repo/api/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormSelect } from "./form-select";
import { FormFieldStory } from "./helpers/form-field-story";

type TypeValues = {
	type: string;
};

const KindField = ({
	disabled,
	error,
}: {
	disabled?: boolean;
	error?: string;
}) => {
	const { t } = useTranslation();

	return (
		<FormFieldStory<TypeValues>
			defaultValues={{ type: "" }}
			{...(disabled ? { disabled } : {})}
			{...(error ? { error: { name: "type", message: error } } : {})}
		>
			{(control) => (
				<FormSelect
					name="type"
					label={t("single.type", { ns: "records" })}
					control={control}
					options={recordTypes.map((recordType) => ({
						value: recordType,
						label: t(`single.kind.${recordType}`, { ns: "records" }),
					}))}
				/>
			)}
		</FormFieldStory>
	);
};

const meta = {
	title: "Shared/Form/Select",
	component: FormSelect,
} satisfies Meta<typeof FormSelect>;

export default meta;

type Story = StoryObj;

export const Idle: Story = {
	render: () => <KindField />,
};

export const WithError: Story = {
	name: "Error",
	render: () => <KindField error="form:title.required" />,
};

export const Disabled: Story = {
	render: () => <KindField disabled />,
};
