import "./instrument";
import * as Sentry from "@sentry/react";
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
		onUncaughtError: Sentry.reactErrorHandler(),
		onCaughtError: Sentry.reactErrorHandler(),
		onRecoverableError: Sentry.reactErrorHandler(),
	} as RootOptions).render(
		<StrictMode>
			<App />
			<Toaster richColors />
		</StrictMode>,
	);
}
