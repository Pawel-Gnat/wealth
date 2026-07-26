export const MIGRATION_ADVISORY_LOCK_KEY = 872_014_260;

type QueryClient = {
	query: (sql: string, params?: unknown[]) => Promise<unknown>;
};

export const withMigrationLock = async <T>(
	client: QueryClient,
	run: () => Promise<T>,
	lockKey = MIGRATION_ADVISORY_LOCK_KEY,
): Promise<T> => {
	await client.query("SELECT pg_advisory_lock($1)", [lockKey]);
	try {
		return await run();
	} finally {
		await client.query("SELECT pg_advisory_unlock($1)", [lockKey]);
	}
};
