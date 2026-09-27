import type { BudgetListItem, BudgetMember } from "@repo/api/types";

export type GroupInvitation = {
	budget: BudgetListItem;
	invitee: BudgetMember;
};

export const getInvitations = (
	budgets: BudgetListItem[],
	userId: string,
): GroupInvitation[] =>
	budgets.flatMap((budget) => {
		const me = budget.members.find((member) => member.id === userId);

		if (me?.status === "pending") {
			return [{ budget, invitee: me }];
		}

		if (budget.ownerId !== userId) {
			return [];
		}

		return budget.members
			.filter((member) => member.status === "pending")
			.map((invitee) => ({ budget, invitee }));
	});
