import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearAuthSession,
	configureAuthSession,
	getAccessToken,
	persistAccessToken,
} from "@/shared/lib/auth/auth-session";
import {
	configureSseGateway,
	resetSseGatewayForTests,
	startSseGateway,
	stopSseGateway,
} from "@/shared/lib/sse/sse-gateway";
import { createMockEventSourceFactory } from "@/test/mocks/event-source";

describe("sse-gateway", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		configureAuthSession({});
		clearAuthSession();
		resetSseGatewayForTests();
	});

	afterEach(() => {
		resetSseGatewayForTests();
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("opens EventSource with credentials and the SSE url", () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});

		startSseGateway();

		expect(instances).toHaveLength(1);
		expect(instances[0]?.url).toBe("http://backend.test/sse");
		expect(instances[0]?.init).toEqual({ withCredentials: true });
	});

	it("does not open a second connection while already started", () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});

		startSseGateway();
		startSseGateway();

		expect(instances).toHaveLength(1);
	});

	it("closes intentionally and does not reconnect after stop", async () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});

		startSseGateway();
		const first = instances[0];
		stopSseGateway();

		expect(first?.close).toHaveBeenCalledOnce();

		first?.emitError();
		await vi.advanceTimersByTimeAsync(60_000);

		expect(instances).toHaveLength(1);
	});

	it("cancels a pending reconnect when stopped intentionally", async () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});

		startSseGateway();
		instances[0]?.emitError();

		await vi.advanceTimersByTimeAsync(500);
		stopSseGateway();
		await vi.advanceTimersByTimeAsync(60_000);

		expect(instances).toHaveLength(1);
	});

	it("closes the source and reconnects with backoff after error", async () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});

		startSseGateway();
		const first = instances[0];
		first?.emitError();

		expect(first?.close).toHaveBeenCalledOnce();
		expect(instances).toHaveLength(1);

		await vi.advanceTimersByTimeAsync(999);
		expect(instances).toHaveLength(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(instances).toHaveLength(2);

		instances[1]?.emitError();
		await vi.advanceTimersByTimeAsync(1_999);
		expect(instances).toHaveLength(2);

		await vi.advanceTimersByTimeAsync(1);
		expect(instances).toHaveLength(3);
	});

	it("resets backoff after a successful open", async () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});

		startSseGateway();
		instances[0]?.emitError();
		await vi.advanceTimersByTimeAsync(1_000);
		instances[1]?.emitOpen();
		instances[1]?.emitError();

		await vi.advanceTimersByTimeAsync(999);
		expect(instances).toHaveLength(2);

		await vi.advanceTimersByTimeAsync(1);
		expect(instances).toHaveLength(3);
	});

	it("clears the session and stops reconnecting on auth.session-revoked", async () => {
		const { createEventSource, instances } = createMockEventSourceFactory();
		configureSseGateway({
			getUrl: () => "http://backend.test/sse",
			createEventSource,
		});
		persistAccessToken("token");

		startSseGateway();
		instances[0]?.emitMessage(
			JSON.stringify({
				type: "auth.session-revoked",
				payload: {},
				scope: "session",
				targetId: "session-1",
				occurredAt: "2026-07-21T12:00:00.000Z",
				id: "evt-1",
			}),
		);

		expect(getAccessToken()).toBeNull();
		expect(instances[0]?.close).toHaveBeenCalledOnce();

		instances[0]?.emitError();
		await vi.advanceTimersByTimeAsync(60_000);
		expect(instances).toHaveLength(1);
	});
});
