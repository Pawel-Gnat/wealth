import * as Sentry from "@sentry/react";
import * as React from "react";
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router";
import { configureWebHttp } from "@/shared/helpers/controlled-fetch";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const mode = import.meta.env.MODE;

if (dsn && (mode === "production" || mode === "staging")) {
	const tracePropagationTargets = import.meta.env.VITE_BACKEND_URL
		? [import.meta.env.VITE_BACKEND_URL, /^\//]
		: [/^\//];

	Sentry.init({
		dsn,
		environment: mode,
		tracesSampleRate: mode === "production" ? 0.1 : 1,
		sendDefaultPii: true,
		enableLogs: true,
		integrations: [
			Sentry.reactRouterV7BrowserTracingIntegration({
				useEffect: React.useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
			Sentry.replayIntegration(),
			Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
		],
		tracePropagationTargets,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
	});
} else {
	Sentry.init({ enabled: false });
}

configureWebHttp((error) => {
	Sentry.captureException(error);
});
