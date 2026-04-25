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
						<AppRoutes />
					</AuthProvider>
				</TooltipProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
