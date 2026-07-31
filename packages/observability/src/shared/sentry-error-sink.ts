import type { ErrorSink, ObservabilityInitConfig } from "./types.js";

type SentryScope = {
	setTag: (key: string, value: string) => void;
	setUser: (user: { id: string }) => void;
};

type SentryClient = {
	init: (options: {
		dsn: string;
		environment: string;
		sendDefaultPii: boolean;
		tracesSampleRate: number;
	}) => void;
	withScope: (callback: (scope: SentryScope) => void) => void;
	captureException: (error: unknown) => void;
};

export const createSentryErrorSink = (
	Sentry: SentryClient,
	config: Pick<ObservabilityInitConfig, "environment"> & {
		errorsDsn: string;
	},
): ErrorSink => {
	Sentry.init({
		dsn: config.errorsDsn,
		environment: config.environment,
		sendDefaultPii: false,
		tracesSampleRate: 0,
	});

	return {
		captureException: (error, context) => {
			Sentry.withScope((scope) => {
				scope.setTag("service", context.service);
				scope.setTag("environment", context.environment);
				if (context.requestId !== undefined) {
					scope.setTag("requestId", context.requestId);
				}
				if (context.userId !== undefined) {
					scope.setUser({ id: context.userId });
				}
				Sentry.captureException(error);
			});
		},
	};
};
