import type { User } from "@repo/api/types";

export const getUserFullName = (user: User) => {
	return user.firstName && user.lastName
		? `${user.firstName} ${user.lastName}`
		: user.email;
};
