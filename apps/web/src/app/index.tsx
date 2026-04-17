import { BrowserRouter } from "react-router";
import { AppRoutes } from "@/app/router";
import { AuthProvider } from "@/context/auth";

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}
