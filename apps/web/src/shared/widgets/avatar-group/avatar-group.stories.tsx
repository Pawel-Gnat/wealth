import type { User } from "@repo/api/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MOCK_USER } from "@/test/mocks/user";
import { AvatarGroup } from "./avatar-group";

const users: User[] = [
	MOCK_USER,
	{
		...MOCK_USER,
		id: `${MOCK_USER.id}2`,
		firstName: null,
		lastName: null,
	},
];

const meta = {
	title: "Widgets/Avatar group",
	component: AvatarGroup,
} satisfies Meta<typeof AvatarGroup>;

export default meta;

type Story = StoryObj;

export const Default: Story = {
	render: () => <AvatarGroup users={users} />,
};
