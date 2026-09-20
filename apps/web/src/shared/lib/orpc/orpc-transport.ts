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

const withCommonHeaders = (headers: Headers, requestId: string) => {
	headers.set(REQUEST_ID_HEADER_NAME, requestId);

	if (typeof window !== "undefined") {
		headers.set("X-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
	}

	return headers;
};

const toFetchArgs = (
	input: RequestInfo | URL,
	init: RequestInit | undefined,
	requestId: string,
): [RequestInfo | URL, RequestInit] => {
	if (typeof Request !== "undefined" && input instanceof Request) {
		const headers = withCommonHeaders(new Headers(input.headers), requestId);
		return [
			new Request(input, { headers, credentials: "include" }),
			{ ...init, credentials: "include" },
		];
	}

	const headers = withCommonHeaders(new Headers(init?.headers), requestId);
	if (typeof FormData !== "undefined" && init?.body instanceof FormData) {
		headers.delete("Content-Type");
	}

	return [input, { ...init, credentials: "include", headers }];
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
		const retryInput =
			typeof Request !== "undefined" && input instanceof Request
				? input.clone()
				: input;
		let response = await fetch(...toFetchArgs(input, init, requestId));

		if (
			response.status === 401 &&
			!isPublicAuthRoute(requestUrl) &&
			typeof window !== "undefined"
		) {
			const { refreshSession } = await import("@/shared/lib/auth/auth-api");
			const snapshot = await refreshSession();

			if (snapshot) {
				response = await fetch(...toFetchArgs(retryInput, init, requestId));
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
