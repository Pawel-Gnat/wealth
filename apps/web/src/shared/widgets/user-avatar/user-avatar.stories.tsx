import type { User } from "@repo/api/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MOCK_USER } from "@/test/mocks/user";
import { UserAvatar } from "./user-avatar";

const emailUser: User = {
	...MOCK_USER,
	firstName: null,
	lastName: null,
};

const meta = {
	title: "Widgets/User avatar",
	component: UserAvatar,
} satisfies Meta<typeof UserAvatar>;

export default meta;

type Story = StoryObj;

export const Default: Story = {
	render: () => <UserAvatar user={MOCK_USER} />,
};

export const Email: Story = {
	render: () => <UserAvatar user={emailUser} />,
};

export const WithEmail: Story = {
	render: () => <UserAvatar user={MOCK_USER} showUserName />,
};

export const AsLink: Story = {
	render: () => <UserAvatar user={MOCK_USER} asLink />,
};
