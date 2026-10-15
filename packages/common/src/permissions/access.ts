import type { BudgetAccess, RecordAccess } from "./types";

export const isOwner = (userId: string | null, budget: BudgetAccess) => {
	if (!userId) {
		return false;
	}

	return userId === budget.ownerId;
};

export const isMember = (userId: string | null, budget: BudgetAccess) => {
	if (!userId || isOwner(userId, budget)) {
		return false;
	}

	return budget.membership === "active";
};

export const isInvitee = (userId: string | null, budget: BudgetAccess) => {
	if (!userId || isOwner(userId, budget)) {
		return false;
	}

	return budget.membership === "pending";
};

export const hasBudgetAccess = (userId: string | null, budget: BudgetAccess) =>
	isOwner(userId, budget) || isMember(userId, budget);

export const isAuthor = (userId: string | null, record: RecordAccess) => {
	if (!userId || userId !== record.authorId) {
		return false;
	}

	if (!record.budget) {
		return true;
	}

	return hasBudgetAccess(userId, record.budget);
};
