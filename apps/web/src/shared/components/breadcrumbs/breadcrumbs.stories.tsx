import type { Meta, StoryObj } from "@storybook/react-vite";
import { MOCK_BUDGET_ID } from "@/test/handlers";
import { MOCK_USER } from "@/test/mocks/user";
import { Breadcrumbs } from "./breadcrumbs";

const meta = {
	title: "Shared/Breadcrumbs",
	component: Breadcrumbs,
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {};

export const Records: Story = {
	parameters: {
		router: {
			initialEntries: ["/records"],
		},
	},
};

export const NewRecord: Story = {
	parameters: {
		router: {
			initialEntries: ["/records/new"],
		},
	},
};

export const Budget: Story = {
	parameters: {
		router: {
			initialEntries: [`/budgets/${MOCK_BUDGET_ID}`],
			routePath: "/budgets/:budgetId",
		},
	},
};

export const BudgetRecord: Story = {
	parameters: {
		router: {
			initialEntries: [`/budgets/${MOCK_BUDGET_ID}/${MOCK_USER.id}`],
			routePath: "/budgets/:budgetId/:recordId",
		},
	},
};

export const Edit: Story = {
	parameters: {
		router: {
			initialEntries: [`/budgets/${MOCK_BUDGET_ID}/${MOCK_USER.id}/edit`],
			routePath: "/budgets/:budgetId/:recordId/edit",
		},
	},
};
