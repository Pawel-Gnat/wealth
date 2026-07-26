import { describe, expect, it, vi } from "vitest";

import { waitForDatabase } from "./wait-for-database.js";

describe("waitForDatabase", () => {
	it("resolves on the first successful ping", async () => {
		const ping = vi.fn().mockResolvedValue(undefined);
		const sleep = vi.fn();

		await expect(
			waitForDatabase(ping, { retries: 3, delayMs: 10, sleep }),
		).resolves.toBeUndefined();

		expect(ping).toHaveBeenCalledTimes(1);
		expect(sleep).not.toHaveBeenCalled();
	});

	it("retries until the database responds", async () => {
		const ping = vi
			.fn()
			.mockRejectedValueOnce(new Error("not ready"))
			.mockRejectedValueOnce(new Error("not ready"))
			.mockResolvedValue(undefined);
		const sleep = vi.fn().mockResolvedValue(undefined);

		await expect(
			waitForDatabase(ping, { retries: 5, delayMs: 25, sleep }),
		).resolves.toBeUndefined();

		expect(ping).toHaveBeenCalledTimes(3);
		expect(sleep).toHaveBeenCalledTimes(2);
		expect(sleep).toHaveBeenCalledWith(25);
	});

	it("throws after exhausting retries", async () => {
		const ping = vi.fn().mockRejectedValue(new Error("down"));
		const sleep = vi.fn().mockResolvedValue(undefined);

		await expect(
			waitForDatabase(ping, { retries: 2, delayMs: 5, sleep }),
		).rejects.toThrow("Database not ready after 2 attempts");

		expect(ping).toHaveBeenCalledTimes(2);
		expect(sleep).toHaveBeenCalledTimes(1);
	});
});
