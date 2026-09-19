import type { GroupBudget } from "@repo/api/types";
import { Budget } from "./budget";

type BudgetsListProps = {
	budgets: GroupBudget[];
	userId: string;
};

export const BudgetsList = ({ budgets, userId }: BudgetsListProps) => {
	return (
		<div className="space-y-4 *:not-last:border-b">
			{budgets.map((budget) => (
				<Budget
					key={budget.id}
					title={budget.title}
					userId={userId}
					members={budget.members}
				/>
			))}
		</div>
	);
};
