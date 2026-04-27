let onClientError: ((error: unknown) => void) | undefined;

export function configureWebHttp(handler: (error: unknown) => void): void {
	onClientError = handler;
}

export function reportClientError(error: unknown): void {
	onClientError?.(error);
}

function rethrowAsRequestError(error: unknown): never {
	if (error instanceof Error) {
		throw new Error(`Failed to fetch: ${error.message}`);
	}
	throw new Error("Unknown error");
}

export async function controlledAsync<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		reportClientError(error);
		rethrowAsRequestError(error);
	}
}
