import type { Meta, StoryObj } from "@storybook/react-vite";
import { MOCK_BUDGET_ID } from "@/test/handlers";
import { Breadcrumbs } from "./breadcrumbs";

const RECORD_ID = "01JTZKQX2GT6PHGQER0M8FS6K8";

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
			initialEntries: [`/budgets/${MOCK_BUDGET_ID}/${RECORD_ID}`],
			routePath: "/budgets/:budgetId/:recordId",
		},
	},
};

export const Edit: Story = {
	parameters: {
		router: {
			initialEntries: [`/budgets/${MOCK_BUDGET_ID}/${RECORD_ID}/edit`],
			routePath: "/budgets/:budgetId/:recordId/edit",
		},
	},
};
