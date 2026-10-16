import { getRoles } from "./get-roles";
import { ROLES } from "./roles";
import type { HasPermission } from "./types";

export const hasPermission: HasPermission = (
	userId,
	resource,
	action,
	data,
) => {
	const roles = getRoles(userId);

	return roles.some((role) => {
		const permission = ROLES[role][resource]?.[action];

		if (typeof permission !== "function") {
			return !!permission;
		}

		return permission(userId, data);
	});
};
