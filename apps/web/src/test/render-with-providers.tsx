import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import i18n from "i18next";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "@/context/auth";

export const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<I18nextProvider i18n={i18n}>
				<AuthProvider>{children}</AuthProvider>
			</I18nextProvider>
		</QueryClientProvider>
	);
};

export const renderWithProviders = (
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => {
	return render(ui, { wrapper: createWrapper(), ...options });
};
