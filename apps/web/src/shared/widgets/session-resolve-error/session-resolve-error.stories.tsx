import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionResolveError } from "./session-resolve-error";

const meta = {
	title: "Widgets/Session resolve error",
	component: SessionResolveError,
	args: {
		onRetry: () => undefined,
	},
} satisfies Meta<typeof SessionResolveError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
