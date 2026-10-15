import { getRoles } from "./get-roles";
import { ROLES } from "./roles";
import type { PermissionCheck, Permissions } from "./types";

type PermissionFn<Resource extends keyof Permissions> = (
	userId: string | null,
	resource: Resource,
	action: Permissions[Resource]["action"],
	data: Permissions[Resource]["dataType"],
) => boolean;

type HasPermission = PermissionFn<"budgets"> & PermissionFn<"records">;

export const hasPermission: HasPermission = (
	userId,
	resource,
	action,
	data,
) => {
	const roles = getRoles(userId);

	return roles.some((role) => {
		const permissions = ROLES[role][resource] as Partial<
			Record<
				Permissions["budgets"]["action"] | Permissions["records"]["action"],
				PermissionCheck<"budgets"> | PermissionCheck<"records">
			>
		>;
		const permission = permissions[action];

		if (!permission) {
			return false;
		}

		if (typeof permission === "boolean") {
			return permission;
		}

		const check = permission as (
			userId: string | null,
			data:
				| Permissions["budgets"]["dataType"]
				| Permissions["records"]["dataType"],
		) => boolean;

		return check(userId, data);
	});
};
