import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL_APP } from "./constants";

@Injectable()
export class PgPoolShutdown implements OnModuleDestroy {
	constructor(@Inject(PG_POOL_APP) private readonly pool: Pool) {}

	async onModuleDestroy() {
		await this.pool.end();
	}
}
