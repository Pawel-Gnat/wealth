import { afterEach, describe, expect, it, vi } from "vitest";
import { createBroadcastBus } from "@/shared/helpers/broadcast-bus";
import { isAuthBusMessage } from "@/shared/lib/auth/auth-tab-sync";
import { createMemoryBroadcastChannelFactory } from "@/test/mocks/broadcast";

describe("auth tab sync bus messages", () => {
	const unsubscribers: Array<() => void> = [];

	afterEach(() => {
		for (const unsubscribe of unsubscribers.splice(0)) {
			unsubscribe();
		}
	});

	it("delivers session-ready and refresh-done", () => {
		const createChannel = createMemoryBroadcastChannelFactory();
		const publisher = createBroadcastBus(
			"wealth.auth",
			isAuthBusMessage,
			createChannel,
		);
		const subscriber = createBroadcastBus(
			"wealth.auth",
			isAuthBusMessage,
			createChannel,
		);
		const listener = vi.fn();

		unsubscribers.push(subscriber.subscribe(listener));
		publisher.publish({ type: "session-ready" });
		publisher.publish({ type: "refresh-done" });

		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenNthCalledWith(1, { type: "session-ready" });
		expect(listener).toHaveBeenNthCalledWith(2, { type: "refresh-done" });
	});

	it("ignores clear messages that are no longer on the bus", () => {
		const createChannel = createMemoryBroadcastChannelFactory();
		const subscriber = createBroadcastBus(
			"wealth.auth",
			isAuthBusMessage,
			createChannel,
		);
		const listener = vi.fn();

		unsubscribers.push(subscriber.subscribe(listener));

		const rawPeer = createChannel("wealth.auth");
		rawPeer?.postMessage({ type: "clear" });
		rawPeer?.postMessage({ type: "session-ready" });

		expect(listener).toHaveBeenCalledOnce();
		expect(listener).toHaveBeenCalledWith({ type: "session-ready" });
	});
});
