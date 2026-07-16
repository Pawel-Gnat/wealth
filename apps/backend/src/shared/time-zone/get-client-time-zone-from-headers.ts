import type { IncomingHttpHeaders } from "node:http";
import { CLIENT_TIMEZONE_HEADER } from "./constants.js";
import { resolveClientTimeZone } from "./resolve-client-time-zone.js";

export const getClientTimeZoneFromHeaders = (
	headers: IncomingHttpHeaders,
): string => {
	const headerValue = headers[CLIENT_TIMEZONE_HEADER];
	const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;

	return resolveClientTimeZone(value);
};
