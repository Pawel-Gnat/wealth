import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const dsn = process.env.SENTRY_DSN;
const nodeEnv = process.env.NODE_ENV ?? "development";
const isSentryEnabled =
	Boolean(dsn) && (nodeEnv === "production" || nodeEnv === "staging");

if (isSentryEnabled && dsn) {
	Sentry.init({
		dsn,
		environment: nodeEnv,
		sendDefaultPii: true,
		tracesSampleRate: nodeEnv === "production" ? 0.1 : 1,
		profilesSampleRate: 1.0,
		integrations: [nodeProfilingIntegration()],
	});
} else {
	Sentry.init({ enabled: false });
}
