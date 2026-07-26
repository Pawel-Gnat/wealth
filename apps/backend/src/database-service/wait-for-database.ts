export type WaitForDatabaseOptions = {
	retries?: number;
	delayMs?: number;
	sleep?: (ms: number) => Promise<void>;
};

export const waitForDatabase = async (
	ping: () => Promise<void>,
	options: WaitForDatabaseOptions = {},
): Promise<void> => {
	const retries = options.retries ?? 30;
	const delayMs = options.delayMs ?? 2_000;
	const sleep =
		options.sleep ??
		((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));

	let lastError: unknown;

	for (let attempt = 1; attempt <= retries; attempt += 1) {
		try {
			await ping();
			return;
		} catch (error) {
			lastError = error;
			if (attempt < retries) {
				await sleep(delayMs);
			}
		}
	}

	throw new Error(`Database not ready after ${retries} attempts`, {
		cause: lastError,
	});
};
