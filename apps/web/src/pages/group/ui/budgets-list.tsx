import { Budget } from "./budget";

export const BudgetsList = () => {
	return (
		<div>
			<Budget
				title="Budget 1"
				assignment="Assignment 1"
				users={["User 1", "User 2", "User 3"]}
			/>
		</div>
	);
};
