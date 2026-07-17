import { reportClientError } from "@/shared/helpers/controlled-fetch";
import { getAccessToken } from "@/shared/lib/auth/auth-session";
import {
	clearAuthSessionAcrossTabs,
	refreshAccessToken,
} from "@/shared/lib/auth/refresh-access-token";

const PUBLIC_AUTH_PATHS = new Set([
	"/auth/signin",
	"/auth/signup",
	"/auth/refresh",
	"/auth/logout",
]);

const getRequestPathname = (requestUrl: string): string => {
	try {
		if (typeof window !== "undefined") {
			return new URL(requestUrl, window.location.origin).pathname;
		}

		return new URL(requestUrl).pathname;
	} catch {
		return requestUrl;
	}
};

const isPublicAuthRoute = (requestUrl: string): boolean => {
	return PUBLIC_AUTH_PATHS.has(getRequestPathname(requestUrl));
};

const shouldAttemptRefresh = (requestUrl: string): boolean => {
	return !isPublicAuthRoute(requestUrl);
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
			const refreshedToken = await refreshAccessToken();

			if (refreshedToken) {
				response = await fetch(input, createRequestInit(init));
			} else if (!isPublicAuthRoute(requestUrl)) {
				clearAuthSessionAcrossTabs();
			}
		} else if (
			response.status === 401 &&
			!isPublicAuthRoute(requestUrl) &&
			typeof window !== "undefined"
		) {
			clearAuthSessionAcrossTabs();
		}

		return response;
	} catch (error) {
		reportClientError(error);
		throw error;
	}
};
