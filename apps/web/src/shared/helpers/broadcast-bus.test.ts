import { afterEach, describe, expect, it, vi } from "vitest";
import { createBroadcastBus } from "@/shared/helpers/broadcast-bus";
import { createMemoryBroadcastChannelFactory } from "@/test/mocks/broadcast";

type TestMessage = {
	type: "ping";
	value: string;
};

const isTestMessage = (data: unknown): data is TestMessage => {
	if (typeof data !== "object" || data === null || !("type" in data)) {
		return false;
	}

	return (
		data.type === "ping" && "value" in data && typeof data.value === "string"
	);
};

describe("createBroadcastBus", () => {
	const unsubscribers: Array<() => void> = [];

	afterEach(() => {
		for (const unsubscribe of unsubscribers.splice(0)) {
			unsubscribe();
		}
	});

	it("delivers typed messages to subscribers on the same channel name", () => {
		const createChannel = createMemoryBroadcastChannelFactory();
		const publisher = createBroadcastBus("bus", isTestMessage, createChannel);
		const subscriber = createBroadcastBus("bus", isTestMessage, createChannel);
		const listener = vi.fn();

		unsubscribers.push(subscriber.subscribe(listener));
		publisher.publish({ type: "ping", value: "hello" });

		expect(listener).toHaveBeenCalledWith({ type: "ping", value: "hello" });
	});

	it("ignores messages that fail the type guard", () => {
		const createChannel = createMemoryBroadcastChannelFactory();
		const publisher = createBroadcastBus("bus", isTestMessage, createChannel);
		const subscriber = createBroadcastBus("bus", isTestMessage, createChannel);
		const listener = vi.fn();

		unsubscribers.push(subscriber.subscribe(listener));
		publisher.publish({ type: "ping", value: "ok" });

		const rawPeer = createChannel("bus");
		rawPeer?.postMessage({ type: "other", value: 1 });

		expect(listener).toHaveBeenCalledOnce();
		expect(listener).toHaveBeenCalledWith({ type: "ping", value: "ok" });
	});

	it("stops delivering after unsubscribe", () => {
		const createChannel = createMemoryBroadcastChannelFactory();
		const publisher = createBroadcastBus("bus", isTestMessage, createChannel);
		const subscriber = createBroadcastBus("bus", isTestMessage, createChannel);
		const listener = vi.fn();

		const unsubscribe = subscriber.subscribe(listener);
		unsubscribe();
		publisher.publish({ type: "ping", value: "gone" });

		expect(listener).not.toHaveBeenCalled();
	});
});
