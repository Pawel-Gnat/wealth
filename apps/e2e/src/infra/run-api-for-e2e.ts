import { execSync, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const TEST_JWT_SECRET = "test-only-jwt-secret";

async function main(): Promise<void> {
	const container = await new PostgreSqlContainer("postgres:16-alpine").start();
	const connectionUri = container.getConnectionUri();

	try {
		execSync("pnpm --filter backend db:migrate", {
			cwd: repoRoot,
			stdio: "inherit",
			env: { ...process.env, DATABASE_URL: connectionUri },
		});
	} catch {
		await container.stop();
		process.exit(1);
	}

	const child = spawn("pnpm", ["--filter", "backend", "dev"], {
		cwd: repoRoot,
		stdio: "inherit",
		env: {
			...process.env,
			DATABASE_URL: connectionUri,
			JWT_SECRET: process.env["JWT_SECRET"] ?? TEST_JWT_SECRET,
		},
		shell: true,
	});

	let shuttingDown = false;

	const shutdown = async () => {
		if (shuttingDown) {
			return;
		}
		shuttingDown = true;
		child.kill("SIGTERM");
		await new Promise((r) => setTimeout(r, 2000));
		try {
			child.kill("SIGKILL");
		} catch {
			/* ignore */
		}
		await container.stop();
		process.exit(0);
	};

	process.on("SIGTERM", () => {
		void shutdown();
	});
	process.on("SIGINT", () => {
		void shutdown();
	});

	child.on("exit", (code, signal) => {
		if (!shuttingDown) {
			void container.stop().finally(() => {
				process.exit(code ?? (signal ? 1 : 0));
			});
		}
	});
}

main().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
