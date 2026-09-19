import type { User } from "@repo/api/types";
import { getInitials } from "./initials";

export const hasUserName = (user: User) => user.firstName && user.lastName;

export const getUserFullName = (user: User) => {
	return `${user.firstName} ${user.lastName}`;
};

export const getUserInitials = (user: User) => {
	if (hasUserName(user)) {
		return getInitials(getUserFullName(user));
	}

	const localPart = user.email.split("@")[0] ?? user.email;
	return localPart.slice(0, 2).toUpperCase();
};
