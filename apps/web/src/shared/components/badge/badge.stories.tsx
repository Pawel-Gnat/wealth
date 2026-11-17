import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "./badge";
import { badgeVariantOptions } from "./badge.variants";

const BadgeStory = (args: Omit<ComponentProps<typeof Badge>, "children">) => {
	const { t } = useTranslation();

	return <Badge {...args}>{t("common.invited", { ns: "common" })}</Badge>;
};

const meta = {
	title: "Shared/Badge",
	component: Badge,
	argTypes: {
		variant: {
			control: "select",
			options: badgeVariantOptions,
		},
	},
	args: {
		children: "",
		variant: "default",
	},
	render: (args) => <BadgeStory {...args} />,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
