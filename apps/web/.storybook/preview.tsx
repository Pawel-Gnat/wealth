import type { Decorator, Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "@/context/auth";
import { Toaster } from "@/shared/components";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { configureSseGateway } from "@/shared/lib/sse";
import { TooltipProvider } from "@/shared/lib/ui/tooltip";
import "../src/index.css";

void init18nWeb({
	lng: "en",
	fallbackLng: "en",
});

configureSseGateway({
	getUrl: () => "http://storybook.local/sse",
	createEventSource: () => ({
		onopen: null,
		onerror: null,
		onmessage: null,
		close: () => undefined,
	}),
});

const StorybookProviders = ({ children }: { children: ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { retry: false },
					mutations: { retry: false },
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<AuthProvider>
					<MemoryRouter>
						{children}
						<Toaster />
					</MemoryRouter>
				</AuthProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
};

const withProviders: Decorator = (Story) => (
	<StorybookProviders>
		<Story />
	</StorybookProviders>
);

const preview: Preview = {
	decorators: [withProviders],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
