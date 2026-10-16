import {
	hasBudgetAccess,
	isAuthor,
	isInvitee,
	isMember,
	isOwner,
} from "./access";
import type { RolesWithPermissions } from "./types";

export const ROLES: RolesWithPermissions = {
	default: {
		budgets: {
			view: (userId, budget) => hasBudgetAccess(userId, budget),
			edit: (userId, budget) => isOwner(userId, budget),
			delete: (userId, budget) => isOwner(userId, budget),
			invite: (userId, budget) => isOwner(userId, budget),
			cancelInvite: (userId, budget) => isOwner(userId, budget),
			leave: (userId, budget) => isMember(userId, budget),
			acceptInvite: (userId, budget) => isInvitee(userId, budget),
			rejectInvite: (userId, budget) => isInvitee(userId, budget),
		},
		records: {
			create: (userId, record) =>
				!!record.budget && hasBudgetAccess(userId, record.budget),
			view: (userId, record) =>
				isAuthor(userId, record) ||
				(!!record.budget && hasBudgetAccess(userId, record.budget)),
			edit: (userId, record) => isAuthor(userId, record),
			delete: (userId, record) => isAuthor(userId, record),
		},
	},
};
