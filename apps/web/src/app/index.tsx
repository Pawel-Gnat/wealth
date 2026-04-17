import { BrowserRouter } from "react-router";
import { AppRoutes } from "@/app/router";
import { AuthProvider } from "@/context/auth";
import { TooltipProvider } from "@/shared/lib/ui/tooltip";

export default function App() {
	return (
		<BrowserRouter>
			<TooltipProvider>
				<AuthProvider>
					<AppRoutes />
				</AuthProvider>
			</TooltipProvider>
		</BrowserRouter>
	);
}
