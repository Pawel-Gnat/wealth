type BroadcastMessageEvent = {
	data: unknown;
};

export type BroadcastChannelLike = {
	postMessage: (message: unknown) => void;
	onmessage: ((event: BroadcastMessageEvent) => void) | null;
};

export type BroadcastChannelFactory = (
	name: string,
) => BroadcastChannelLike | null;

type BroadcastBus<TMessage> = {
	publish: (message: TMessage) => void;
	subscribe: (listener: (message: TMessage) => void) => () => void;
};

const defaultBroadcastChannelFactory: BroadcastChannelFactory = (name) => {
	if (typeof BroadcastChannel === "undefined") {
		return null;
	}

	const nativeChannel = new BroadcastChannel(name);
	let handler: ((event: BroadcastMessageEvent) => void) | null = null;

	return {
		postMessage: (message) => {
			nativeChannel.postMessage(message);
		},
		get onmessage() {
			return handler;
		},
		set onmessage(next) {
			handler = next;
			nativeChannel.onmessage = next
				? (event) => {
						next({ data: event.data });
					}
				: null;
		},
	};
};

export const createBroadcastBus = <TMessage>(
	name: string,
	isMessage: (data: unknown) => data is TMessage,
	createChannel: BroadcastChannelFactory = defaultBroadcastChannelFactory,
): BroadcastBus<TMessage> => {
	let channel: BroadcastChannelLike | null | undefined;
	const listeners = new Set<(message: TMessage) => void>();

	const getChannel = (): BroadcastChannelLike | null => {
		if (channel !== undefined) {
			return channel;
		}

		channel = createChannel(name);
		if (!channel) {
			return null;
		}

		channel.onmessage = (event) => {
			if (!isMessage(event.data)) {
				return;
			}

			for (const listener of listeners) {
				listener(event.data);
			}
		};

		return channel;
	};

	return {
		publish: (message) => {
			getChannel()?.postMessage(message);
		},
		subscribe: (listener) => {
			getChannel();
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
};
