import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthProvider } from "@/context/auth";
import { TooltipProvider } from "@/shared/lib/ui/tooltip";

type RouterOptions = {
	initialEntries?: string[];
	routePath?: string;
};

export const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

export const createWrapper = (
	queryClient: QueryClient = createTestQueryClient(),
	router?: RouterOptions,
) => {
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter
				{...(router?.initialEntries
					? { initialEntries: router.initialEntries }
					: {})}
			>
				<TooltipProvider>
					<AuthProvider>
						{router?.routePath ? (
							<Routes>
								<Route path={router.routePath} element={children} />
							</Routes>
						) : (
							children
						)}
					</AuthProvider>
				</TooltipProvider>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> &
	RouterOptions;

export const renderWithProviders = (
	ui: ReactElement,
	options?: RenderWithProvidersOptions,
) => {
	const { initialEntries, routePath, ...renderOptions } = options ?? {};
	const queryClient = createTestQueryClient();
	const routerOptions: RouterOptions = {
		...(initialEntries ? { initialEntries } : {}),
		...(routePath ? { routePath } : {}),
	};
	const result = render(ui, {
		wrapper: createWrapper(queryClient, routerOptions),
		...renderOptions,
	});

	return { ...result, queryClient };
};
