import { afterEach, describe, expect, it, vi } from "vitest";
import {
	type BroadcastChannelFactory,
	type BroadcastChannelLike,
	createBroadcastBus,
} from "./broadcast-bus";

type TestMessage = {
	type: "ping";
	value: string;
};

const isTestMessage = (data: unknown): data is TestMessage => {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	const message = data as Partial<TestMessage>;
	return message.type === "ping" && typeof message.value === "string";
};

const createMemoryBroadcastChannelFactory = (): BroadcastChannelFactory => {
	const hubs = new Map<string, Set<BroadcastChannelLike>>();

	return (name) => {
		const hub = hubs.get(name) ?? new Set<BroadcastChannelLike>();
		hubs.set(name, hub);

		const channel: BroadcastChannelLike = {
			onmessage: null,
			postMessage: (message) => {
				for (const peer of hub) {
					if (peer === channel) {
						continue;
					}

					peer.onmessage?.({ data: message });
				}
			},
		};

		hub.add(channel);
		return channel;
	};
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
