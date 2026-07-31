import type { ContextStore, ObservabilityContext } from "./types.js";

export const createModuleContextStore = (): ContextStore => {
	let context: ObservabilityContext = {};

	return {
		get: () => context,
		setRequestId: (requestId) => {
			context = { ...context, requestId };
		},
		clearRequestId: () => {
			const { requestId: _requestId, ...rest } = context;
			context = rest;
		},
		setUserId: (userId) => {
			context = { ...context, userId };
		},
		clearUserId: () => {
			const { userId: _userId, ...rest } = context;
			context = rest;
		},
	};
};
