import type { BudgetMember, GroupBudget } from "@repo/api/types";

export type GroupInvitation = {
	budget: GroupBudget;
	invitee: BudgetMember;
};

export const getActiveBudgets = (budgets: GroupBudget[], userId: string) =>
	budgets.filter((budget) =>
		budget.members.some(
			(member) => member.id === userId && member.status === "active",
		),
	);

export const getInvitations = (
	budgets: GroupBudget[],
	userId: string,
): GroupInvitation[] =>
	budgets.flatMap((budget) => {
		const me = budget.members.find((member) => member.id === userId);

		if (me?.status === "pending") {
			return [{ budget, invitee: me }];
		}

		if (
			!budget.members.some(
				(member) => member.id === userId && member.role === "owner",
			)
		) {
			return [];
		}

		return budget.members
			.filter((member) => member.status === "pending")
			.map((invitee) => ({ budget, invitee }));
	});
