import type { BudgetMemberStatus, User } from "@repo/api/types";

export const permissionRoles = ["default"] as const;

export type PermissionRole = (typeof permissionRoles)[number];

export type BudgetAccess = {
	ownerId: User["id"];
	membership: BudgetMemberStatus | null;
};

export type RecordAccess = {
	authorId: User["id"];
	budget: BudgetAccess | null;
};

export type Permissions = {
	budgets: {
		dataType: BudgetAccess;
		action:
			| "view"
			| "edit"
			| "delete"
			| "invite"
			| "cancelInvite"
			| "leave"
			| "acceptInvite"
			| "rejectInvite";
	};
	records: {
		dataType: RecordAccess;
		action: "create" | "view" | "edit" | "delete";
	};
};

export type HasPermission = <Resource extends keyof Permissions>(
	userId: string | null,
	resource: Resource,
	action: Permissions[Resource]["action"],
	data: Permissions[Resource]["dataType"],
) => boolean;

export type PermissionCheck<Resource extends keyof Permissions> =
	| boolean
	| ((
			userId: string | null,
			data: Permissions[Resource]["dataType"],
	  ) => boolean);

export type RolesWithPermissions = {
	[Role in PermissionRole]: Partial<{
		[Resource in keyof Permissions]: Partial<{
			[Action in Permissions[Resource]["action"]]: PermissionCheck<Resource>;
		}>;
	}>;
};
