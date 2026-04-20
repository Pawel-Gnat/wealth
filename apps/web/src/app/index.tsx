import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { AppRoutes } from "@/app/router";
import { AuthProvider } from "@/context/auth";
import { TooltipProvider } from "@/shared/lib/ui/tooltip";

const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<TooltipProvider>
					<AuthProvider>
						<main className="flex min-h-svh w-full items-center justify-center p-4 md:p-6">
							<AppRoutes />
						</main>
					</AuthProvider>
				</TooltipProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
