import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

const REDIS_CLIENT_OPTIONS = {
	lazyConnect: true,
	maxRetriesPerRequest: 1,
	enableOfflineQueue: false,
	retryStrategy: (times: number) => Math.min(times * 200, 2000),
} as const;

const REDIS_RECONNECT_INITIAL_MS = 2_000;
const REDIS_RECONNECT_MAX_MS = 30_000;

type RedisMessageListener = (channel: string, message: string) => void;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name);
	private redisUrl: string | null = null;
	private publisher: Redis | null = null;
	private subscriber: Redis | null = null;
	private connectInFlight: Promise<boolean> | null = null;
	private reconnectAttempt = 0;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly messageListeners = new Set<RedisMessageListener>();
	private readonly readyListeners = new Set<() => void>();

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		const redisUrl = this.configService.get<string>("REDIS_URL");
		if (!redisUrl) {
			this.logger.warn("REDIS_URL is not set; Redis pub/sub is disabled");
			return;
		}

		this.redisUrl = redisUrl;
		const connected = await this.ensureConnected();
		if (!connected) {
			this.scheduleReconnectAttempt();
		}
	}

	async onModuleDestroy() {
		this.clearReconnectTimer();
		await this.clearClients();
	}

	isAvailable() {
		return this.publisher !== null && this.subscriber !== null;
	}

	getPublisher() {
		return this.publisher;
	}

	getSubscriber() {
		return this.subscriber;
	}

	async publish(channel: string, message: string) {
		if (!(await this.ensureConnected())) {
			return false;
		}

		try {
			await this.publisher?.publish(channel, message);
			return true;
		} catch (error) {
			this.logger.warn(
				`Failed to publish to ${channel}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return false;
		}
	}

	async subscribe(channel: string) {
		if (!(await this.ensureConnected())) {
			return false;
		}

		try {
			await this.subscriber?.subscribe(channel);
			return true;
		} catch (error) {
			this.logger.warn(
				`Failed to subscribe to ${channel}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return false;
		}
	}

	async unsubscribe(channel: string) {
		if (!this.subscriber) {
			return false;
		}

		try {
			await this.subscriber.unsubscribe(channel);
			return true;
		} catch (error) {
			this.logger.warn(
				`Failed to unsubscribe from ${channel}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return false;
		}
	}

	onMessage(listener: RedisMessageListener) {
		this.messageListeners.add(listener);
		this.subscriber?.on("message", listener);

		return () => {
			this.messageListeners.delete(listener);
			this.subscriber?.off("message", listener);
		};
	}

	onReady(listener: () => void) {
		this.readyListeners.add(listener);
		if (this.isAvailable()) {
			listener();
		}

		return () => {
			this.readyListeners.delete(listener);
		};
	}

	async ensureConnected(): Promise<boolean> {
		if (this.publisher !== null && this.subscriber !== null) {
			return true;
		}

		if (!this.redisUrl) {
			return false;
		}

		if (this.connectInFlight) {
			return this.connectInFlight;
		}

		this.connectInFlight = this.connectClients().finally(() => {
			this.connectInFlight = null;
		});

		return this.connectInFlight;
	}

	private async connectClients(): Promise<boolean> {
		if (!this.redisUrl) {
			return false;
		}

		const publisher = new Redis(this.redisUrl, REDIS_CLIENT_OPTIONS);
		const subscriber = new Redis(this.redisUrl, REDIS_CLIENT_OPTIONS);
		this.attachErrorHandlers(publisher, "publisher");
		this.attachErrorHandlers(subscriber, "subscriber");

		try {
			await Promise.all([publisher.connect(), subscriber.connect()]);
			this.publisher = publisher;
			this.subscriber = subscriber;
			this.attachStoredMessageListeners(subscriber);
			this.reconnectAttempt = 0;
			this.clearReconnectTimer();
			this.notifyReady();
			return true;
		} catch (error) {
			this.logger.warn(
				`Redis is unavailable; continuing without pub/sub: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			await Promise.allSettled([publisher.quit(), subscriber.quit()]);
			this.publisher = null;
			this.subscriber = null;
			this.scheduleReconnectAttempt();
			return false;
		}
	}

	private async clearClients() {
		await Promise.allSettled([this.publisher?.quit(), this.subscriber?.quit()]);
		this.publisher = null;
		this.subscriber = null;
	}

	private attachStoredMessageListeners(subscriber: Redis) {
		for (const listener of this.messageListeners) {
			subscriber.on("message", listener);
		}
	}

	private notifyReady() {
		for (const listener of this.readyListeners) {
			listener();
		}
	}

	private scheduleReconnectAttempt() {
		if (!this.redisUrl || this.isAvailable() || this.reconnectTimer !== null) {
			return;
		}

		const delayMs = Math.min(
			REDIS_RECONNECT_INITIAL_MS * 2 ** this.reconnectAttempt,
			REDIS_RECONNECT_MAX_MS,
		);
		this.reconnectAttempt += 1;

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			void this.ensureConnected().then((connected) => {
				if (!connected) {
					this.scheduleReconnectAttempt();
				}
			});
		}, delayMs);
	}

	private clearReconnectTimer() {
		if (this.reconnectTimer === null) {
			return;
		}

		clearTimeout(this.reconnectTimer);
		this.reconnectTimer = null;
	}

	private attachErrorHandlers(client: Redis, label: string) {
		client.on("error", (error) => {
			this.logger.warn(
				`Redis ${label} error: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		});
	}
}
