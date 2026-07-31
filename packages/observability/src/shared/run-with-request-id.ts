import type { Observability } from "./types.js";

export const createRunWithRequestId = (
	observability: Pick<Observability, "setRequestId" | "clearRequestId">,
) => {
	return async <T>(fn: (requestId: string) => Promise<T>): Promise<T> => {
		const requestId = crypto.randomUUID();
		observability.setRequestId(requestId);
		try {
			return await fn(requestId);
		} finally {
			observability.clearRequestId(requestId);
		}
	};
};
