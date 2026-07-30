import { createModuleContextStore } from "../shared/context-store.js";
import { createObservability } from "../shared/create-observability.js";

const observability = createObservability(createModuleContextStore());

export const {
	init,
	logger,
	captureException,
	setRequestId,
	clearRequestId,
	setUserId,
	clearUserId,
} = observability;

export type {
	ObservabilityInitConfig,
	ObservabilityService,
} from "../shared/types.js";
