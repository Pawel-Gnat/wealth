import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const migrationsFolder = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../drizzle",
);

export default async function globalSetup(): Promise<() => Promise<void>> {
	const container = await new PostgreSqlContainer("postgres:16-alpine").start();

	const connectionUri = container.getConnectionUri();
	process.env.DATABASE_URL = connectionUri;

	const pool = new Pool({ connectionString: connectionUri });
	const db = drizzle(pool);
	await migrate(db, { migrationsFolder });
	await pool.end();

	return async () => {
		await container.stop();
	};
}
