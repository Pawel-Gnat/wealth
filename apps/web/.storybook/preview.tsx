import type { Decorator, Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isCommonAssetRequest } from "msw";
import { setupWorker } from "msw/browser";
import { mswLoader } from "msw-storybook-addon/csf3";
import { type ReactNode, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthProvider } from "@/context/auth";
import { Toaster } from "@/shared/components";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { configureSseGateway } from "@/shared/lib/sse";
import { TooltipProvider } from "@/shared/lib/ui/tooltip";
import { HANDLERS } from "@/test/mocks/handlers";
import "../src/index.css";

const isStorybookRequest = (url: string) =>
	/\.eot$|\.mdx$|sb-common-assets|__webpack_hmr|iframe.html|sb-vite|@vite|@react-refresh|\/virtual:|\.stories\./.test(
		url,
	);

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

type StoryRouterParameters = {
	initialEntries?: string[];
	routePath?: string;
};

const StorybookProviders = ({
	children,
	initialEntries,
	routePath,
}: { children: ReactNode } & StoryRouterParameters) => {
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
					<MemoryRouter {...(initialEntries ? { initialEntries } : {})}>
						{routePath ? (
							<Routes>
								<Route path={routePath} element={children} />
							</Routes>
						) : (
							children
						)}
						<Toaster />
					</MemoryRouter>
				</AuthProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
};

const withProviders: Decorator = (Story, context) => {
	const router = context.parameters["router"] as
		| StoryRouterParameters
		| undefined;

	return (
		<StorybookProviders {...router}>
			<Story />
		</StorybookProviders>
	);
};

const preview: Preview = {
	decorators: [withProviders],
	loaders: [
		mswLoader(async () => {
			const worker = setupWorker(...HANDLERS);

			await worker.start({
				onUnhandledRequest(request, print) {
					if (
						isCommonAssetRequest(request) ||
						isStorybookRequest(request.url)
					) {
						return;
					}
					print.error();
				},
			});

			return worker;
		}),
	],
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
