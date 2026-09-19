import { sseEventSchema } from "@repo/api/schemas";
import type { SseEvent } from "@repo/api/types";
import { logger, SSE_OBSERVABILITY_EVENTS } from "@repo/observability/browser";
import { clearAuthSession } from "@/shared/lib/auth/auth-api";

const RECONNECT_INITIAL_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

export const dispatchSseMessage = (raw: string): SseEvent | null => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		logger.warn(SSE_OBSERVABILITY_EVENTS.frameMalformed);
		return null;
	}

	const result = sseEventSchema.safeParse(parsed);
	if (!result.success) {
		logger.warn(SSE_OBSERVABILITY_EVENTS.envelopeInvalid);
		return null;
	}

	const event = result.data;

	switch (event.type) {
		case "session-ended":
			clearAuthSession();
			break;
	}

	return event;
};

export type EventSourceLike = {
	close: () => void;
	onopen: ((event: Event) => void) | null;
	onerror: ((event: Event) => void) | null;
	onmessage: ((event: MessageEvent) => void) | null;
};

export type EventSourceFactory = (
	url: string,
	init?: EventSourceInit,
) => EventSourceLike;

type SseGatewayConfig = {
	getUrl: () => string;
	createEventSource: EventSourceFactory;
};

const defaultCreateEventSource: EventSourceFactory = (url, init) =>
	new EventSource(url, init);

const getDefaultSseUrl = (): string => {
	const baseUrl = import.meta.env.VITE_BACKEND_URL;
	if (!baseUrl) {
		throw new Error("VITE_BACKEND_URL is not set");
	}

	return `${baseUrl.replace(/\/$/, "")}/sse`;
};

const defaultConfig: SseGatewayConfig = {
	getUrl: getDefaultSseUrl,
	createEventSource: defaultCreateEventSource,
};

let config: SseGatewayConfig = { ...defaultConfig };
let source: EventSourceLike | null = null;
let intentionalClose = false;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isStarted = false;

const clearReconnectTimer = (): void => {
	if (reconnectTimer === null) {
		return;
	}

	clearTimeout(reconnectTimer);
	reconnectTimer = null;
};

const reconnectDelayMs = (attempt: number): number => {
	const delay = RECONNECT_INITIAL_MS * 2 ** attempt;
	return Math.min(delay, RECONNECT_MAX_MS);
};

const detachSource = (): void => {
	if (!source) {
		return;
	}

	source.onopen = null;
	source.onerror = null;
	source.onmessage = null;
	source.close();
	source = null;
};

const openConnection = (): void => {
	detachSource();

	const nextSource = config.createEventSource(config.getUrl(), {
		withCredentials: true,
	});

	nextSource.onopen = () => {
		reconnectAttempt = 0;
	};

	nextSource.onmessage = (event) => {
		const sseEvent = dispatchSseMessage(String(event.data));
		if (sseEvent?.type === "session-ended") {
			stopSseGateway();
		}
	};

	nextSource.onerror = () => {
		if (intentionalClose) {
			return;
		}

		detachSource();
		scheduleReconnect();
	};

	source = nextSource;
};

const scheduleReconnect = (): void => {
	if (intentionalClose || !isStarted || reconnectTimer !== null) {
		return;
	}

	const delayMs = reconnectDelayMs(reconnectAttempt);
	reconnectAttempt += 1;

	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		if (intentionalClose || !isStarted) {
			return;
		}

		openConnection();
	}, delayMs);
};

export const configureSseGateway = (next: Partial<SseGatewayConfig>): void => {
	config = {
		...config,
		...next,
	};
};

export const startSseGateway = (): void => {
	if (isStarted) {
		return;
	}

	intentionalClose = false;
	isStarted = true;
	openConnection();
};

export const stopSseGateway = (): void => {
	intentionalClose = true;
	isStarted = false;
	clearReconnectTimer();
	detachSource();
	reconnectAttempt = 0;
};

export const resetSseGatewayForTests = (): void => {
	stopSseGateway();
	config = { ...defaultConfig };
};
