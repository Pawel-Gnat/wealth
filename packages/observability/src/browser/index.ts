import { Logtail } from "@logtail/browser";
import * as Sentry from "@sentry/browser";
import { createModuleContextStore } from "../shared/context-store";
import { createObservability } from "../shared/create-observability";
import { createLogtailLogSink } from "../shared/logtail-sink";
import { resolveInitConfig } from "../shared/resolve-init-config";
import { createRunWithRequestId } from "../shared/run-with-request-id";
import { createSentryErrorSink } from "../shared/sentry-error-sink";
import type { ObservabilityInitConfig } from "../shared/types";

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
	getRequestId,
	setRequestId,
	clearRequestId,
	setUserId,
	clearUserId,
} = observability;

export const runWithRequestId = createRunWithRequestId(observability);

export type {
	AuthObservabilityEvent,
	DocumentMutationEvent,
	DocumentRecordKind,
	SseObservabilityEvent,
} from "../shared/observability-events";

export {
	AUTH_OBSERVABILITY_EVENTS,
	DOCUMENT_OBSERVABILITY_EVENTS,
	getDocumentObservabilityEvents,
	SSE_OBSERVABILITY_EVENTS,
} from "../shared/observability-events";
export type {
	BetterStackConfig,
	ObservabilityInitConfig,
	ObservabilityService,
} from "../shared/types";
