import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "./select";

const TypeSelectStory = () => {
	const { t } = useTranslation();
	const [value, setValue] = useState("all");

	return (
		<Select
			className="max-w-50 w-full min-w-30 gap-1.5"
			label={t("list.type", { ns: "records" })}
			value={value}
			onValueChange={setValue}
			options={[
				{ value: "all", label: t("list.all", { ns: "records" }) },
				{
					value: "expense",
					label: t("single.kind.expense", { ns: "records" }),
				},
				{
					value: "income",
					label: t("single.kind.income", { ns: "records" }),
				},
			]}
		/>
	);
};

const meta = {
	title: "Shared/Select",
	component: Select,
	render: () => <TypeSelectStory />,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Type: Story = {
	args: {
		label: "Type",
		value: "all",
		options: [],
		onValueChange: () => undefined,
	},
};
