import { Logtail } from "@logtail/node";
import * as Sentry from "@sentry/node";
import { createObservability } from "../shared/create-observability.js";
import { createLogtailLogSink } from "../shared/logtail-sink.js";
import { resolveInitConfig } from "../shared/resolve-init-config.js";
import { createSentryErrorSink } from "../shared/sentry-error-sink.js";
import type { ObservabilityInitConfig } from "../shared/types.js";
import { createAsyncLocalContextStore } from "./async-local-context-store.js";

const store = createAsyncLocalContextStore();
const observability = createObservability(store);

export const runWithContext = store.runWithContext;

export const init = (config: ObservabilityInitConfig) => {
	observability.init(
		resolveInitConfig(config, (betterStack) => ({
			logSink: createLogtailLogSink(Logtail, betterStack),
			errorSink: createSentryErrorSink(Sentry, {
				environment: config.environment,
				errorsDsn: betterStack.errorsDsn,
			}),
		})),
	);
};

export const {
	logger,
	captureException,
	getRequestId,
	setRequestId,
	clearRequestId,
	setUserId,
	clearUserId,
} = observability;

export type {
	BetterStackConfig,
	ObservabilityInitConfig,
	ObservabilityService,
} from "../shared/types.js";
