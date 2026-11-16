import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertModalSkeleton } from "./alert-modal-skeleton";

const meta = {
	title: "Shared/Alert modal skeleton",
	component: AlertModalSkeleton,
	args: {
		onClose: () => undefined,
	},
} satisfies Meta<typeof AlertModalSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
