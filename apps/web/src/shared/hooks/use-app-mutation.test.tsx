import { ORPCError } from "@orpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
		},
	});

	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe("useAppMutation", () => {
	const onError = vi.fn();

	beforeEach(() => {
		onError.mockClear();
	});

	it("skips onError when the request is rate limited", async () => {
		const { result } = renderHook(
			() =>
				useAppMutation({
					mutationFn: () => Promise.reject(new ORPCError("TOO_MANY_REQUESTS")),
					onError,
				}),
			{ wrapper: createWrapper() },
		);

		result.current.mutate(undefined);

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});
		expect(onError).not.toHaveBeenCalled();
	});

	it("calls onError for other failures", async () => {
		const failure = new Error("nope");
		const { result } = renderHook(
			() =>
				useAppMutation({
					mutationFn: () => Promise.reject(failure),
					onError,
				}),
			{ wrapper: createWrapper() },
		);

		result.current.mutate(undefined);

		await waitFor(() => {
			expect(onError).toHaveBeenCalledWith(
				failure,
				undefined,
				undefined,
				expect.anything(),
			);
		});
	});
});
