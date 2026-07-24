import { vi } from "vitest";
import type {
	EventSourceFactory,
	EventSourceLike,
} from "@/shared/lib/sse/sse-gateway";

export type MockEventSource = EventSourceLike & {
	url: string;
	init?: EventSourceInit;
	emitOpen: () => void;
	emitError: () => void;
	emitMessage: (data: string) => void;
};

export const createMockEventSourceFactory = () => {
	const instances: MockEventSource[] = [];

	const createEventSource: EventSourceFactory = (url, init) => {
		const instance: MockEventSource = {
			url,
			onopen: null,
			onerror: null,
			onmessage: null,
			close: vi.fn(),
			emitOpen: () => {
				instance.onopen?.(new Event("open"));
			},
			emitError: () => {
				instance.onerror?.(new Event("error"));
			},
			emitMessage: (data) => {
				instance.onmessage?.(new MessageEvent("message", { data }));
			},
		};

		if (init) {
			instance.init = init;
		}

		instances.push(instance);
		return instance;
	};

	return { createEventSource, instances };
};
