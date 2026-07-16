import { describe, expect, it } from "vitest";
import { FALLBACK_TIME_ZONE } from "./constants.js";
import { getClientTimeZoneFromHeaders } from "./get-client-time-zone-from-headers.js";

describe("getClientTimeZoneFromHeaders", () => {
	it("reads a string header value", () => {
		expect(
			getClientTimeZoneFromHeaders({ "x-timezone": "Europe/Warsaw" }),
		).toBe("Europe/Warsaw");
	});

	it("uses the first value when the header is an array", () => {
		expect(
			getClientTimeZoneFromHeaders({
				"x-timezone": ["Europe/Warsaw", "UTC"],
			}),
		).toBe("Europe/Warsaw");
	});

	it("falls back to UTC when the header is missing", () => {
		expect(getClientTimeZoneFromHeaders({})).toBe(FALLBACK_TIME_ZONE);
	});
});
