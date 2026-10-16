import { createContext, type ReactNode, useContext, useState } from "react";

type RouteChunkLoadContextValue = {
	isRetrying: boolean;
	retryChunk: <T>(task: () => Promise<T>) => Promise<T>;
};

const RouteChunkLoadContext = createContext<RouteChunkLoadContextValue | null>(
	null,
);

export function RouteChunkLoadProvider({ children }: { children: ReactNode }) {
	const [isRetrying, setIsRetrying] = useState(false);

	const retryChunk = async <T,>(task: () => Promise<T>): Promise<T> => {
		setIsRetrying(true);
		try {
			return await task();
		} finally {
			setIsRetrying(false);
		}
	};

	return (
		<RouteChunkLoadContext value={{ isRetrying, retryChunk }}>
			{children}
		</RouteChunkLoadContext>
	);
}

export function useRouteChunkLoad(): RouteChunkLoadContextValue {
	const ctx = useContext(RouteChunkLoadContext);
	if (!ctx) {
		throw new Error(
			"useRouteChunkLoad must be used within RouteChunkLoadProvider",
		);
	}
	return ctx;
}
