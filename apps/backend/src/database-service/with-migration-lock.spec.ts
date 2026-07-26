import { describe, expect, it, vi } from "vitest";

import {
	MIGRATION_ADVISORY_LOCK_KEY,
	withMigrationLock,
} from "./with-migration-lock.js";

describe("withMigrationLock", () => {
	it("acquires the advisory lock, runs the callback, then unlocks", async () => {
		const query = vi.fn().mockResolvedValue(undefined);
		const run = vi.fn().mockResolvedValue("migrated");

		await expect(withMigrationLock({ query }, run)).resolves.toBe("migrated");

		expect(query).toHaveBeenNthCalledWith(1, "SELECT pg_advisory_lock($1)", [
			MIGRATION_ADVISORY_LOCK_KEY,
		]);
		expect(run).toHaveBeenCalledTimes(1);
		expect(query).toHaveBeenNthCalledWith(2, "SELECT pg_advisory_unlock($1)", [
			MIGRATION_ADVISORY_LOCK_KEY,
		]);
	});

	it("unlocks even when the callback throws", async () => {
		const query = vi.fn().mockResolvedValue(undefined);
		const run = vi.fn().mockRejectedValue(new Error("migrate failed"));

		await expect(withMigrationLock({ query }, run)).rejects.toThrow(
			"migrate failed",
		);

		expect(query).toHaveBeenCalledWith("SELECT pg_advisory_unlock($1)", [
			MIGRATION_ADVISORY_LOCK_KEY,
		]);
	});
});
