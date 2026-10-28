export type ObservabilityService = "web" | "backend";

export type LogLevel = "info" | "warn" | "error";

export type ObservabilityContext = {
	requestId?: string;
	userId?: string;
};

export type DomainLogOwnerType = "user" | "budget";

export type DomainLogSubjectType = "user" | "budget" | "record";

export type DomainLogContext = {
	actorId: string;
	ownerType: DomainLogOwnerType;
	ownerId: string;
	subjectType: DomainLogSubjectType;
	subjectId: string;
};

export type LogRecord = {
	service: ObservabilityService;
	environment: string;
	level: LogLevel;
	event: string;
	requestId?: string;
	userId?: string;
	actorId?: string;
	ownerType?: DomainLogOwnerType;
	ownerId?: string;
	subjectType?: DomainLogSubjectType;
	subjectId?: string;
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

export type BetterStackConfig = {
	sourceToken: string;
	ingestingHost: string;
	errorsDsn: string;
};

export type ObservabilityInitConfig = {
	service: ObservabilityService;
	environment: string;
	betterStack?: BetterStackConfig;
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
	info: (event: string, domain?: DomainLogContext) => void;
	warn: (event: string, domain?: DomainLogContext) => void;
	error: (event: string, domain?: DomainLogContext) => void;
};

export type Observability = {
	init: (config: ObservabilityInitConfig) => void;
	logger: Logger;
	captureException: (error: unknown) => void;
	getRequestId: () => string | undefined;
	setRequestId: (requestId: string) => void;
	clearRequestId: (requestId?: string) => void;
	setUserId: (userId: string) => void;
	clearUserId: () => void;
};
