import { describe, expect, it } from "vitest";
import { FALLBACK_TIME_ZONE } from "./constants.js";
import { resolveClientTimeZone } from "./resolve-client-time-zone.js";

describe("resolveClientTimeZone", () => {
	it("returns UTC when value is missing or blank", () => {
		expect(resolveClientTimeZone(undefined)).toBe(FALLBACK_TIME_ZONE);
		expect(resolveClientTimeZone("")).toBe(FALLBACK_TIME_ZONE);
		expect(resolveClientTimeZone("   ")).toBe(FALLBACK_TIME_ZONE);
	});

	it("accepts a valid IANA time zone", () => {
		expect(resolveClientTimeZone("Europe/Warsaw")).toBe("Europe/Warsaw");
		expect(resolveClientTimeZone("America/New_York")).toBe("America/New_York");
	});

	it("falls back to UTC for an invalid time zone", () => {
		expect(resolveClientTimeZone("Foo/Bar")).toBe(FALLBACK_TIME_ZONE);
		expect(resolveClientTimeZone("Not/AZone")).toBe(FALLBACK_TIME_ZONE);
	});
});
