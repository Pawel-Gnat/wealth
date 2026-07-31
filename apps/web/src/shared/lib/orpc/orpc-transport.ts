import {
	AUTH_CSRF_HEADER_NAME,
	AUTH_CSRF_HEADER_VALUE,
	REQUEST_ID_HEADER_NAME,
} from "@repo/common/constants";
import {
	clearRequestId,
	getRequestId,
	setRequestId,
} from "@repo/observability/browser";
import { reportClientError } from "@/shared/helpers/controlled-fetch";
import {
	clearAuthSession,
	getAccessToken,
} from "@/shared/lib/auth/auth-session";
import { refreshAccessToken } from "@/shared/lib/auth/refresh-access-token";

const PUBLIC_AUTH_PATHS = new Set([
	"/auth/signin",
	"/auth/signup",
	"/auth/refresh",
	"/auth/logout",
]);

const COOKIE_AUTH_CSRF_PATHS = new Set(["/auth/refresh", "/auth/logout"]);

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

const createRequestInit = (
	requestUrl: string,
	requestId: string,
	init?: RequestInit,
): RequestInit => {
	const headers = new Headers(init?.headers);
	const token = getAccessToken();

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	if (COOKIE_AUTH_CSRF_PATHS.has(getRequestPathname(requestUrl))) {
		headers.set(AUTH_CSRF_HEADER_NAME, AUTH_CSRF_HEADER_VALUE);
	}

	headers.set(REQUEST_ID_HEADER_NAME, requestId);

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
	const existingRequestId = getRequestId();
	const requestId = existingRequestId ?? crypto.randomUUID();
	const ownsRequestId = existingRequestId === undefined;

	if (ownsRequestId) {
		setRequestId(requestId);
	}

	try {
		let response = await fetch(
			input,
			createRequestInit(requestUrl, requestId, init),
		);

		if (
			response.status === 401 &&
			shouldAttemptRefresh(requestUrl) &&
			typeof window !== "undefined"
		) {
			const refreshedToken = await refreshAccessToken();

			if (refreshedToken) {
				response = await fetch(
					input,
					createRequestInit(requestUrl, requestId, init),
				);
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
	} finally {
		if (ownsRequestId) {
			clearRequestId(requestId);
		}
	}
};
