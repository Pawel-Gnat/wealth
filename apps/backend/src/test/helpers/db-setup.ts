import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const migrationsFolder = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../../drizzle",
);

export interface TestDatabaseContext {
	connectionUri: string;
	stop: () => Promise<void>;
}

export async function setupTestDatabase(): Promise<TestDatabaseContext> {
	const container = await new PostgreSqlContainer("postgres:16-alpine").start();
	const connectionUri = container.getConnectionUri();

	const pool = new Pool({ connectionString: connectionUri });
	const db = drizzle(pool);
	await migrate(db, { migrationsFolder });
	await pool.end();

	return {
		connectionUri,
		stop: async () => {
			await container.stop();
		},
	};
}
