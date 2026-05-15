import * as Sentry from "@sentry/nestjs";

const dsn = process.env.SENTRY_DSN;
const nodeEnv = process.env.NODE_ENV ?? "development";
const isDeployedEnv = nodeEnv === "production";
const isSentryEnabled = Boolean(dsn) && isDeployedEnv;

if (isSentryEnabled && dsn) {
	const { nodeProfilingIntegration } = await import("@sentry/profiling-node");
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
