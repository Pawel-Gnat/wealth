import type { User } from "@repo/api/types";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";

type BudgetWithMembers = {
	id: string;
	owner: User;
	members: User[];
};

const budgetMembers = (budget: BudgetWithMembers | undefined) => {
	if (!budget) return [];

	const users = new Map<string, User>();
	users.set(budget.owner.id, budget.owner);

	for (const member of budget.members) {
		users.set(member.id, member);
	}

	return [...users.values()];
};

export const membersForBudget = (
	budgets: BudgetWithMembers[] | undefined,
	budgetId: string,
) => budgetMembers(budgets?.find((budget) => budget.id === budgetId));

export const selectedMembers = (users: User[], userIds: string[]) =>
	users.filter((user) => userIds.includes(user.id));

export const memberIds = (users: User[]) => users.map((user) => user.id);

export const memberIdsParam = (userIds: string[]) =>
	userIds.length > 0 ? userIds : null;

export const sameMember = (member: User, selected: User) =>
	member.id === selected.id;

export const memberLabel = (user: User) =>
	hasUserName(user) ? getUserFullName(user) : user.email;
