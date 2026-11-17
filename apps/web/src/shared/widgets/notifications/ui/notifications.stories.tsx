import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	getNotificationsEmptyHandler,
	getNotificationsErrorHandler,
	getNotificationsLoadingHandler,
	getNotificationsWithDataHandler,
} from "@/test/handlers";
import { Notifications } from "./notifications";

const meta = {
	title: "Widgets/Notifications",
	component: Notifications,
	render: () => <Notifications />,
} satisfies Meta<typeof Notifications>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
	parameters: {
		msw: {
			handlers: [getNotificationsLoadingHandler],
		},
	},
};

export const WithError: Story = {
	name: "Error",
	parameters: {
		msw: {
			handlers: [getNotificationsErrorHandler],
		},
	},
};

export const Empty: Story = {
	parameters: {
		msw: {
			handlers: [getNotificationsEmptyHandler],
		},
	},
};

export const WithData: Story = {
	parameters: {
		msw: {
			handlers: [getNotificationsWithDataHandler],
		},
	},
};
