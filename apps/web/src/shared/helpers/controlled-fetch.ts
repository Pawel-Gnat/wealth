function rethrowAsRequestError(error: unknown): never {
	if (error instanceof Error) {
		throw new Error(`Failed to fetch: ${error.message}`);
	}
	throw new Error("Unknown error");
}

/** For arbitrary async calls (e.g. ORPC). Extend this module for shared monitoring / timing. */
export const controlledAsync = async <T>(fn: () => Promise<T>): Promise<T> => {
	try {
		return await fn();
	} catch (error) {
		rethrowAsRequestError(error);
	}
};

export const controlledFetch = async <T>(
	fetchFn: () => Promise<Response>,
): Promise<T> => {
	try {
		const response = await fetchFn();
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}
		return (await response.json()) as T;
	} catch (error) {
		rethrowAsRequestError(error);
	}
};
