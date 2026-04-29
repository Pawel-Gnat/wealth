import { type ChildProcess, spawn } from "node:child_process";
import { setupTestDatabase } from "./helpers/db-setup.js";

const SHUTDOWN_GRACE_MS = 2_000;

type StartBackendOptions = {
	databaseUrl: string;
	stopDb: () => Promise<void>;
};

function startBackendWithLifecycle({
	databaseUrl,
	stopDb,
}: StartBackendOptions): void {
	const backend: ChildProcess = spawn("pnpm", ["--filter", "backend", "dev"], {
		stdio: "inherit",
		shell: true,
		env: {
			...process.env,
			DATABASE_URL: databaseUrl,
			JWT_SECRET: "test-only-jwt-secret",
		},
	});

	let shuttingDown = false;

	const waitForExit = (): Promise<void> =>
		new Promise((resolve) => {
			if (backend.exitCode !== null || backend.signalCode !== null) {
				resolve();
				return;
			}
			backend.once("exit", () => resolve());
		});

	const shutdown = async (code = 0): Promise<void> => {
		if (shuttingDown) return;
		shuttingDown = true;

		backend.kill("SIGTERM");

		const forceKillTimer = setTimeout(() => {
			if (backend.exitCode === null && backend.signalCode === null) {
				backend.kill("SIGKILL");
			}
		}, SHUTDOWN_GRACE_MS);

		try {
			await waitForExit();
		} finally {
			clearTimeout(forceKillTimer);
			await stopDb();
			process.exit(code);
		}
	};

	process.once("SIGTERM", () => void shutdown());
	process.once("SIGINT", () => void shutdown());

	backend.once("exit", (code, signal) => {
		if (!shuttingDown) {
			void shutdown(code ?? (signal ? 1 : 0));
		}
	});
}

async function main(): Promise<void> {
	const { connectionUri, stop } = await setupTestDatabase();

	startBackendWithLifecycle({
		databaseUrl: connectionUri,
		stopDb: stop,
	});
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
