export type ObservabilityService = "web" | "backend";

export type LogLevel = "info" | "warn" | "error";

export type ObservabilityContext = {
	requestId?: string;
	userId?: string;
};

export type LogRecord = {
	service: ObservabilityService;
	environment: string;
	level: LogLevel;
	event: string;
	requestId?: string;
	userId?: string;
};

export type LogSink = {
	write: (record: LogRecord) => void;
};

export type ErrorSink = {
	captureException: (
		error: unknown,
		context: ObservabilityContext & {
			service: ObservabilityService;
			environment: string;
		},
	) => void;
};

export type ObservabilityInitConfig = {
	service: ObservabilityService;
	environment: string;
	logSink?: LogSink;
	errorSink?: ErrorSink;
};

export type ContextStore = {
	get: () => ObservabilityContext;
	setRequestId: (requestId: string) => void;
	clearRequestId: () => void;
	setUserId: (userId: string) => void;
	clearUserId: () => void;
};

export type Logger = {
	info: (event: string) => void;
	warn: (event: string) => void;
	error: (event: string) => void;
};

export type Observability = {
	init: (config: ObservabilityInitConfig) => void;
	logger: Logger;
	captureException: (error: unknown) => void;
	setRequestId: (requestId: string) => void;
	clearRequestId: () => void;
	setUserId: (userId: string) => void;
	clearUserId: () => void;
};
