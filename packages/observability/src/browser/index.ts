import { Logtail } from "@logtail/browser";
import * as Sentry from "@sentry/browser";
import { createModuleContextStore } from "../shared/context-store.js";
import { createObservability } from "../shared/create-observability.js";
import { createLogtailLogSink } from "../shared/logtail-sink.js";
import { resolveInitConfig } from "../shared/resolve-init-config.js";
import { createSentryErrorSink } from "../shared/sentry-error-sink.js";
import type { ObservabilityInitConfig } from "../shared/types.js";

const observability = createObservability(createModuleContextStore());

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
