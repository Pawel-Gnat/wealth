import { recordKinds } from "@repo/api/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { FormSelect } from "./form-select";
import { FormFieldStory } from "./helpers/form-field-story";

type KindValues = {
	kind: string;
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
		<FormFieldStory<KindValues>
			defaultValues={{ kind: "" }}
			{...(disabled ? { disabled } : {})}
			{...(error ? { error: { name: "kind", message: error } } : {})}
		>
			{(control) => (
				<FormSelect
					name="kind"
					label={t("single.type", { ns: "records" })}
					control={control}
					options={recordKinds.map((kind) => ({
						value: kind,
						label: t(`single.kind.${kind}`, { ns: "records" }),
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
