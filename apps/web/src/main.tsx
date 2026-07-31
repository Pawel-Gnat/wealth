import "./instrument";
import { captureException } from "@repo/observability/browser";
import { StrictMode } from "react";
import { createRoot, type RootOptions } from "react-dom/client";
import "./index.css";
import App from "@/app";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { Toaster } from "@/shared/lib/ui/sonner";

const initialLanguage = document.documentElement.lang || "en";

init18nWeb({
	lng: initialLanguage,
	fallbackLng: initialLanguage,
}).catch(console.error);

const root = document.getElementById("root");

if (root) {
	createRoot(root, {
		onUncaughtError: (error) => captureException(error),
		onCaughtError: (error) => captureException(error),
		onRecoverableError: (error) => captureException(error),
	} as RootOptions).render(
		<StrictMode>
			<App />
			<Toaster richColors />
		</StrictMode>,
	);
}
