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

	const withRequestId = <T>(fn: () => T): T => {
		const existingRequestId = store.get().requestId;
		const ownedRequestId =
			existingRequestId === undefined ? crypto.randomUUID() : undefined;

		if (ownedRequestId !== undefined) {
			store.setRequestId(ownedRequestId);
		}

		try {
			return fn();
		} finally {
			if (
				ownedRequestId !== undefined &&
				store.get().requestId === ownedRequestId
			) {
				store.clearRequestId();
			}
		}
	};

	const buildMeta = (runtime: RuntimeState) => {
		const context = store.get();
		return {
			service: runtime.service,
			environment: runtime.environment,
			...(context.requestId !== undefined
				? { requestId: context.requestId }
				: {}),
			...(context.userId !== undefined ? { userId: context.userId } : {}),
		};
	};

	const emit = (level: LogLevel, event: string) => {
		withRequestId(() => {
			const runtime = ensureInitialized();
			runtime.logSink.write({
				...buildMeta(runtime),
				level,
				event,
			});
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
			withRequestId(() => {
				const runtime = ensureInitialized();
				const meta = buildMeta(runtime);

				runtime.errorSink.captureException(error, meta);
				runtime.logSink.write({
					...meta,
					level: "error",
					event: "exception.captured",
				});
			});
		},
		getRequestId: () => store.get().requestId,
		setRequestId: (requestId) => {
			store.setRequestId(requestId);
		},
		clearRequestId: (requestId) => {
			if (requestId !== undefined && store.get().requestId !== requestId) {
				return;
			}
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
