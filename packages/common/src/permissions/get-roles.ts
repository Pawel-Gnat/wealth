import type { PermissionRole } from "./types";

export const getRoles = (userId: string | null): PermissionRole[] => {
	if (!userId) {
		return [];
	}

	return ["default"];
};
