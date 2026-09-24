import type { GroupBudget } from "@repo/api/types";
import { Fragment } from "react";
import { Separator } from "@/shared/components";
import { Budget } from "./budget";

type BudgetsListProps = {
	budgets: GroupBudget[];
	userId: string;
};

export const BudgetsList = ({ budgets, userId }: BudgetsListProps) => {
	return (
		<div className="space-y-2">
			{budgets.map((budget, index) => (
				<Fragment key={budget.id}>
					<Budget
						id={budget.id}
						title={budget.title}
						userId={userId}
						members={budget.members}
					/>
					{index !== budgets.length - 1 && (
						<Separator orientation="horizontal" />
					)}
				</Fragment>
			))}
		</div>
	);
};
