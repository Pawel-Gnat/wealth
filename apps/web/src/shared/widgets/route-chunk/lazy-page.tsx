import type { ComponentType } from "react";
import { RouteChunkError } from "./route-chunk-error";

export const lazyPage = (load: () => Promise<ComponentType>) => async () => {
	try {
		return { Component: await load() };
	} catch {
		return { Component: RouteChunkError };
	}
};
