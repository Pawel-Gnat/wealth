import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayInTimeZone } from "./get-today-in-time-zone.js";

describe("getTodayInTimeZone", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the UTC calendar day for UTC", () => {
		vi.setSystemTime(new Date("2026-07-15T23:30:00.000Z"));

		expect(getTodayInTimeZone("UTC")).toBe("2026-07-15");
	});

	it("returns the local calendar day for Europe/Warsaw", () => {
		vi.setSystemTime(new Date("2026-07-15T23:30:00.000Z"));

		expect(getTodayInTimeZone("Europe/Warsaw")).toBe("2026-07-16");
	});

	it("falls back to UTC when the time zone is invalid", () => {
		vi.setSystemTime(new Date("2026-07-15T23:30:00.000Z"));

		expect(getTodayInTimeZone("Foo/Bar")).toBe("2026-07-15");
	});
});
