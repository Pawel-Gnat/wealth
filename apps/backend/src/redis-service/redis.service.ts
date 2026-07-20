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

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name);
	private publisher: Redis | null = null;
	private subscriber: Redis | null = null;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		const redisUrl = this.configService.get<string>("REDIS_URL");
		if (!redisUrl) {
			this.logger.warn("REDIS_URL is not set; Redis pub/sub is disabled");
			return;
		}

		const publisher = new Redis(redisUrl, REDIS_CLIENT_OPTIONS);
		const subscriber = new Redis(redisUrl, REDIS_CLIENT_OPTIONS);
		this.attachErrorHandlers(publisher, "publisher");
		this.attachErrorHandlers(subscriber, "subscriber");

		try {
			await Promise.all([publisher.connect(), subscriber.connect()]);
			this.publisher = publisher;
			this.subscriber = subscriber;
		} catch (error) {
			this.logger.warn(
				`Redis is unavailable; continuing without pub/sub: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			await Promise.allSettled([publisher.quit(), subscriber.quit()]);
			this.publisher = null;
			this.subscriber = null;
		}
	}

	async onModuleDestroy() {
		await Promise.allSettled([this.publisher?.quit(), this.subscriber?.quit()]);
		this.publisher = null;
		this.subscriber = null;
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
		if (!this.publisher) {
			return false;
		}

		try {
			await this.publisher.publish(channel, message);
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
