import type { ComponentType } from "react";
import { RouteChunkError } from "./route-chunk-error";

export const lazyPage = (load: () => Promise<ComponentType>) => ({
	lazy: async () => {
		try {
			return { Component: await load() };
		} catch {
			return {
				Component: () => <RouteChunkError load={load} />,
			};
		}
	},
});
