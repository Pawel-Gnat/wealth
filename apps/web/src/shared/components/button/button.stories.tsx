import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { buttonVariantOptions } from "./button.variants";

const ButtonStory = (args: Omit<ComponentProps<typeof Button>, "children">) => {
	const { t } = useTranslation();

	return <Button {...args}>{t("action.save", { ns: "common" })}</Button>;
};

const meta = {
	title: "Shared/Button",
	component: Button,
	argTypes: {
		variant: {
			control: "select",
			options: buttonVariantOptions,
		},
	},
	args: {
		children: "",
		variant: "default",
	},
	render: (args) => <ButtonStory {...args} />,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const Loading: Story = {
	args: {
		isLoading: true,
	},
};
