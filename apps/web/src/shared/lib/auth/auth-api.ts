import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { clearAuthSession } from "@/shared/lib/auth/auth-session";
import { refreshAccessToken } from "@/shared/lib/auth/refresh-access-token";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

export const bootstrapSession = async (): Promise<boolean> => {
	const token = await refreshAccessToken();
	return token !== null;
};

export const logoutSession = async (): Promise<void> => {
	try {
		await controlledAsync(() => orpcClient.user.logout());
	} finally {
		clearAuthSession();
	}
};
