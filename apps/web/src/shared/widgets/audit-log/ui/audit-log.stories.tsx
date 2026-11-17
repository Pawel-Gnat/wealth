import { AUTH_AUDIT_EVENTS } from "@repo/api/events";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	getAuditsEmptyHandler,
	getAuditsErrorHandler,
	getAuditsLoadingHandler,
} from "@/test/handlers";
import { MOCK_USER } from "@/test/mocks/user";
import { AuditLog } from "./audit-log";

const renderAuditLog = () => (
	<AuditLog params={{ actions: [...AUTH_AUDIT_EVENTS] }} users={[MOCK_USER]} />
);

const meta = {
	title: "Widgets/Audit log",
	component: AuditLog,
} satisfies Meta<typeof AuditLog>;

export default meta;

type Story = StoryObj;

export const Loading: Story = {
	render: renderAuditLog,
	parameters: {
		msw: {
			handlers: [getAuditsLoadingHandler],
		},
	},
};

export const WithError: Story = {
	name: "Error",
	render: renderAuditLog,
	parameters: {
		msw: {
			handlers: [getAuditsErrorHandler],
		},
	},
};

export const Empty: Story = {
	render: renderAuditLog,
	parameters: {
		msw: {
			handlers: [getAuditsEmptyHandler],
		},
	},
};

export const WithData: Story = {
	render: renderAuditLog,
};
