import type { Request } from "express";

export const userIdFromRequest = (request: Request): string => {
	const userId = request.user?.userId;
	if (!userId) {
		throw new Error("SessionGuard must set request.user");
	}

	return userId;
};
