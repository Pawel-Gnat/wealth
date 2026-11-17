import type { Meta, StoryObj } from "@storybook/react-vite";
import { Price } from "./price";

const meta = {
	title: "Shared/Price",
	component: Price,
	args: {
		amount: 123.45,
		language: "en",
	},
} satisfies Meta<typeof Price>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
