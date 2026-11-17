import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingBar } from "./loading-bar";

const meta = {
	title: "Widgets/Loading bar",
	component: LoadingBar,
	args: {
		isLoading: false,
	},
} satisfies Meta<typeof LoadingBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Loading: Story = {
	args: {
		isLoading: true,
	},
};
