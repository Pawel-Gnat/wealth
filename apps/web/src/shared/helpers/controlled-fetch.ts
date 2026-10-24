import { ORPCError } from "@orpc/client";

let onClientError: ((error: unknown) => void) | undefined;

export function configureWebHttp(handler: (error: unknown) => void): void {
	onClientError = handler;
}

export function reportClientError(error: unknown): void {
	onClientError?.(error);
}

export const isTooManyRequests = (error: unknown): boolean =>
	error instanceof ORPCError && error.status === 429;

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
		if (isTooManyRequests(error)) {
			throw error;
		}

		reportClientError(error);
		rethrowAsRequestError(error);
	}
}
