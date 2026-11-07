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
	private client: Redis | null = null;

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		const redisUrl = this.configService.get<string>("REDIS_URL");
		if (!redisUrl) {
			this.logger.warn("REDIS_URL is not set");
			return;
		}

		const client = new Redis(redisUrl, REDIS_CLIENT_OPTIONS);
		client.on("error", (error: unknown) => {
			this.logger.warn(
				`Redis error: ${error instanceof Error ? error.message : String(error)}`,
			);
		});
		this.client = client;

		try {
			await client.connect();
		} catch (error) {
			this.logger.warn(
				`Redis is unavailable: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	async onModuleDestroy() {
		const client = this.client;
		if (!client) {
			return;
		}

		this.client = null;

		try {
			await client.quit();
		} catch (error) {
			this.logger.warn(
				`Redis quit failed: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			client.disconnect();
		}
	}

	async ping(): Promise<boolean> {
		if (!this.client) {
			return false;
		}

		try {
			const result = await this.client.ping();
			return result === "PONG";
		} catch (error) {
			this.logger.warn(
				`Redis ping failed: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return false;
		}
	}
}
