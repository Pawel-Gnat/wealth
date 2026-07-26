import { describe, expect, it } from "vitest";

import { isProduction } from "./is-production.js";

describe("isProduction", () => {
	it("returns true in production", () => {
		expect(isProduction("production")).toBe(true);
	});

	it("returns false outside production", () => {
		expect(isProduction("development")).toBe(false);
		expect(isProduction("test")).toBe(false);
		expect(isProduction(undefined)).toBe(false);
	});
});
