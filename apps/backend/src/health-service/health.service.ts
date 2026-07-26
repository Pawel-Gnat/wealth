import {
	Inject,
	Injectable,
	ServiceUnavailableException,
} from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL_APP } from "../database-service/constants.js";

@Injectable()
export class HealthService {
	constructor(@Inject(PG_POOL_APP) private readonly pool: Pool) {}

	getLiveness() {
		return { status: "ok" as const };
	}

	async getReadiness() {
		try {
			await this.pool.query("SELECT 1");
			return { status: "ok" as const };
		} catch (error) {
			throw new ServiceUnavailableException({
				status: "error" as const,
				reason: error instanceof Error ? error.message : "database_unavailable",
			});
		}
	}
}
