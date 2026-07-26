import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { waitForDatabase } from "../dist/database-service/wait-for-database.js";
import { withMigrationLock } from "../dist/database-service/with-migration-lock.js";

const appRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const migrationsFolder = path.join(appRoot, "drizzle");
const mainPath = path.join(appRoot, "dist", "main.js");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is not set");
}

await waitForDatabase(async () => {
	const pool = new pg.Pool({ connectionString: databaseUrl });
	try {
		await pool.query("SELECT 1");
	} finally {
		await pool.end();
	}
});

const pool = new pg.Pool({ connectionString: databaseUrl });
const lockClient = await pool.connect();
try {
	await withMigrationLock(lockClient, async () => {
		const db = drizzle(pool);
		await migrate(db, { migrationsFolder });
	});
} finally {
	lockClient.release();
	await pool.end();
}

const child = spawn(process.execPath, [mainPath], {
	stdio: "inherit",
	env: process.env,
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => {
		child.kill(signal);
	});
}
