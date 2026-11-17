import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouteChunkError } from "./route-chunk-error";

const meta = {
	title: "Widgets/Route chunk error",
	component: RouteChunkError,
} satisfies Meta<typeof RouteChunkError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
