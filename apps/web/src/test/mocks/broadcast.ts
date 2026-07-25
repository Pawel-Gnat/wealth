import type {
	BroadcastChannelFactory,
	BroadcastChannelLike,
} from "@/shared/helpers/broadcast-bus";

export const createMemoryBroadcastChannelFactory =
	(): BroadcastChannelFactory => {
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
