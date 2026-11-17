import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageLoader } from "./page-loader";

const meta = {
	title: "Widgets/Page loader",
	component: PageLoader,
} satisfies Meta<typeof PageLoader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
