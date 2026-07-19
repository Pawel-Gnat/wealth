import { describe, expect, it } from "vitest";
import { formatPercentChange } from "./format-percent-change";

describe("formatPercentChange", () => {
	it("formats positive change with plus sign", () => {
		expect(formatPercentChange(12.543)).toBe("+12.5%");
	});

	it("formats negative change with minus sign", () => {
		expect(formatPercentChange(-3.21)).toBe("-3.2%");
	});

	it("formats zero without plus sign", () => {
		expect(formatPercentChange(0)).toBe("0.0%");
	});
});
