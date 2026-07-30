import {
	createConsoleErrorSink,
	createConsoleLogSink,
} from "./console-sink.js";
import type {
	ContextStore,
	ErrorSink,
	LogLevel,
	LogSink,
	Observability,
	ObservabilityInitConfig,
	ObservabilityService,
} from "./types.js";

type RuntimeState = {
	service: ObservabilityService;
	environment: string;
	logSink: LogSink;
	errorSink: ErrorSink;
};

export const createObservability = (store: ContextStore): Observability => {
	let state: RuntimeState | undefined;

	const ensureInitialized = (): RuntimeState => {
		if (!state) {
			throw new Error(
				"@repo/observability: call init() before using logger or captureException",
			);
		}
		return state;
	};

	const emit = (level: LogLevel, event: string) => {
		const runtime = ensureInitialized();
		const context = store.get();
		runtime.logSink.write({
			service: runtime.service,
			environment: runtime.environment,
			level,
			event,
			...(context.requestId !== undefined
				? { requestId: context.requestId }
				: {}),
			...(context.userId !== undefined ? { userId: context.userId } : {}),
		});
	};

	return {
		init: (config: ObservabilityInitConfig) => {
			state = {
				service: config.service,
				environment: config.environment,
				logSink: config.logSink ?? createConsoleLogSink(),
				errorSink: config.errorSink ?? createConsoleErrorSink(),
			};
		},
		logger: {
			info: (event) => emit("info", event),
			warn: (event) => emit("warn", event),
			error: (event) => emit("error", event),
		},
		captureException: (error) => {
			const runtime = ensureInitialized();
			const context = store.get();
			runtime.errorSink.captureException(error, {
				service: runtime.service,
				environment: runtime.environment,
				...(context.requestId !== undefined
					? { requestId: context.requestId }
					: {}),
				...(context.userId !== undefined ? { userId: context.userId } : {}),
			});
		},
		setRequestId: (requestId) => {
			store.setRequestId(requestId);
		},
		clearRequestId: () => {
			store.clearRequestId();
		},
		setUserId: (userId) => {
			store.setUserId(userId);
		},
		clearUserId: () => {
			store.clearUserId();
		},
	};
};
