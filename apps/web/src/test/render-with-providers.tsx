import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "@/context/auth";
import { TooltipProvider } from "@/shared/lib/ui/tooltip";

export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

export const createWrapper = (
	queryClient: QueryClient = createTestQueryClient(),
) => {
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<TooltipProvider>
					<AuthProvider>{children}</AuthProvider>
				</TooltipProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

export const renderWithProviders = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => {
	const queryClient = createTestQueryClient();
	const result = render(ui, {
		wrapper: createWrapper(queryClient),
		...options,
	});

	return { ...result, queryClient };
};
