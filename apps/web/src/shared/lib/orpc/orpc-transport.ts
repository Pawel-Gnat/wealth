import { REQUEST_ID_HEADER_NAME } from "@repo/common/constants";
import {
	clearRequestId,
	getRequestId,
	setRequestId,
} from "@repo/observability/browser";
import { reportClientError } from "@/shared/helpers/controlled-fetch";

const PUBLIC_AUTH_PATHS = new Set([
	"/auth/signin",
	"/auth/signup",
	"/auth/refresh",
	"/auth/logout",
]);

const toRequestUrl = (input: RequestInfo | URL): string => {
	if (typeof input === "string") {
		return input;
	}

	if (input instanceof URL) {
		return input.href;
	}

	if (typeof Request !== "undefined" && input instanceof Request) {
		return input.url;
	}

	return String(input);
};

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

const createRequestInit = (
	requestId: string,
	init?: RequestInit,
): RequestInit => {
	const headers = new Headers(init?.headers);
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
	const requestUrl = toRequestUrl(input);
	const existingRequestId = getRequestId();
	const requestId = existingRequestId ?? crypto.randomUUID();
	const ownsRequestId = existingRequestId === undefined;

	if (ownsRequestId) {
		setRequestId(requestId);
	}

	try {
		let response = await fetch(input, createRequestInit(requestId, init));

		if (
			response.status === 401 &&
			!isPublicAuthRoute(requestUrl) &&
			typeof window !== "undefined"
		) {
			const { refreshSession } = await import("@/shared/lib/auth/auth-api");
			const snapshot = await refreshSession();

			if (snapshot) {
				response = await fetch(input, createRequestInit(requestId, init));
			}
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
