import { AsyncLocalStorage } from "node:async_hooks";
import type { ContextStore, ObservabilityContext } from "../shared/types.js";

type StoreState = ObservabilityContext;

const storage = new AsyncLocalStorage<StoreState>();

export type AsyncLocalContextStore = ContextStore & {
	runWithContext: <T>(fn: () => T) => T;
};

export const createAsyncLocalContextStore = (): AsyncLocalContextStore => {
	const getActiveStore = (): StoreState | undefined => storage.getStore();

	return {
		runWithContext: (fn) => storage.run({}, fn),
		get: () => {
			const store = getActiveStore();
			return store ? { ...store } : {};
		},
		setRequestId: (requestId) => {
			const store = getActiveStore();
			if (!store) {
				return;
			}
			store.requestId = requestId;
		},
		clearRequestId: () => {
			const store = getActiveStore();
			if (!store) {
				return;
			}
			delete store.requestId;
		},
		setUserId: (userId) => {
			const store = getActiveStore();
			if (!store) {
				return;
			}
			store.userId = userId;
		},
		clearUserId: () => {
			const store = getActiveStore();
			if (!store) {
				return;
			}
			delete store.userId;
		},
	};
};
