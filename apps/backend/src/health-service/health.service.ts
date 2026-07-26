import {
	Inject,
	Injectable,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL_APP } from "../database-service/constants.js";
import { RedisService } from "../redis-service/redis.service.js";

@Injectable()
export class HealthService {
	private readonly logger = new Logger(HealthService.name);

	constructor(
		@Inject(PG_POOL_APP) private readonly pool: Pool,
		private readonly redisService: RedisService,
	) {}

	getLiveness() {
		return { status: "ok" as const };
	}

	async getReadiness() {
		try {
			await this.pool.query("SELECT 1");
		} catch (error) {
			this.logger.warn(
				`Database readiness check failed: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			throw new ServiceUnavailableException({
				status: "error" as const,
				reason: "database_unavailable",
			});
		}

		const redisOk = await this.redisService.ping();
		if (!redisOk) {
			this.logger.warn("Redis readiness check failed");
			throw new ServiceUnavailableException({
				status: "error" as const,
				reason: "redis_unavailable",
			});
		}

		return { status: "ok" as const };
	}
}
