import { describe, expect, it } from "vitest";

import { shouldMountInProduction } from "./should-mount-in-production.js";

describe("shouldMountInProduction", () => {
	it("returns true in production", () => {
		expect(shouldMountInProduction("production")).toBe(true);
	});

	it("returns false outside production", () => {
		expect(shouldMountInProduction("development")).toBe(false);
		expect(shouldMountInProduction("test")).toBe(false);
		expect(shouldMountInProduction(undefined)).toBe(false);
	});
});
