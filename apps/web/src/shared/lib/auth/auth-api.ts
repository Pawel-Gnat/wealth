import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import {
	clearAuthSession,
	persistAccessToken,
} from "@/shared/lib/auth/auth-session";
import { withRefreshMutex } from "@/shared/lib/auth/refresh-access-token";
import { refreshAccessTokenRaw } from "@/shared/lib/auth/refresh-access-token-raw";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

const refreshAccessTokenViaOrpc = async (): Promise<string | null> => {
	try {
		const result = await controlledAsync(() => orpcClient.user.refresh());
		persistAccessToken(result.data.token);
		return result.data.token;
	} catch {
		return null;
	}
};

export const refreshAccessToken = async (): Promise<string | null> => {
	return withRefreshMutex(refreshAccessTokenViaOrpc);
};

export const bootstrapSession = async (): Promise<boolean> => {
	const token = await withRefreshMutex(refreshAccessTokenRaw);
	return token !== null;
};

export const logoutSession = async (): Promise<void> => {
	try {
		await controlledAsync(() => orpcClient.user.logout());
	} finally {
		clearAuthSession();
	}
};
