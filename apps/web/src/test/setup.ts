import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "./msw-setup";

global.ResizeObserver = vi.fn(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

class TestEventSource {
	url: string;
	init?: EventSourceInit;
	onopen: ((event: Event) => void) | null = null;
	onerror: ((event: Event) => void) | null = null;
	onmessage: ((event: MessageEvent) => void) | null = null;
	close = vi.fn();

	constructor(url: string, init?: EventSourceInit) {
		this.url = url;
		if (init) {
			this.init = init;
		}
	}
}

vi.stubGlobal("EventSource", TestEventSource);

afterEach(() => {
	cleanup();
});
