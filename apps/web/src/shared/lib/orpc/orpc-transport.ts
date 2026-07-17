import { reportClientError } from "@/shared/helpers/controlled-fetch";
import { delay } from "@/shared/helpers/delay";
import {
	clearAuthSession,
	getAccessToken,
} from "@/shared/lib/auth/auth-session";
import { withRefreshMutex } from "@/shared/lib/auth/refresh-access-token";
import { refreshAccessTokenRaw } from "@/shared/lib/auth/refresh-access-token-raw";

const PUBLIC_AUTH_PATHS = [
	"/auth/signin",
	"/auth/signup",
	"/auth/refresh",
	"/auth/logout",
] as const;

const REFRESH_RETRY_DELAY_MS = 150;

const isPublicAuthRoute = (requestUrl: string): boolean => {
	return PUBLIC_AUTH_PATHS.some((path) => requestUrl.includes(path));
};

const shouldAttemptRefresh = (requestUrl: string): boolean => {
	return !PUBLIC_AUTH_PATHS.some((path) => requestUrl.includes(path));
};

const createRequestInit = (init?: RequestInit): RequestInit => {
	const headers = new Headers(init?.headers);
	const token = getAccessToken();

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	if (typeof window !== "undefined") {
		headers.set("X-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
	}

	return {
		...init,
		credentials: "include",
		headers,
	};
};

const refreshAccessTokenWithRetry = async (): Promise<string | null> => {
	const firstAttempt = await withRefreshMutex(refreshAccessTokenRaw);
	if (firstAttempt) {
		return firstAttempt;
	}

	await delay(REFRESH_RETRY_DELAY_MS);
	return withRefreshMutex(refreshAccessTokenRaw);
};

export const orpcTransportFetch = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const requestUrl = String(input);

	try {
		let response = await fetch(input, createRequestInit(init));

		if (
			response.status === 401 &&
			shouldAttemptRefresh(requestUrl) &&
			typeof window !== "undefined"
		) {
			const refreshedToken = await refreshAccessTokenWithRetry();

			if (refreshedToken) {
				response = await fetch(input, createRequestInit(init));
			} else if (!isPublicAuthRoute(requestUrl)) {
				clearAuthSession();
			}
		} else if (
			response.status === 401 &&
			!isPublicAuthRoute(requestUrl) &&
			typeof window !== "undefined"
		) {
			clearAuthSession();
		}

		return response;
	} catch (error) {
		reportClientError(error);
		throw error;
	}
};
