import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DBS, PG_POOL_APP } from "./constants.js";
import { PgPoolShutdown } from "./pg-pool.shutdown.js";

@Global()
@Module({
	providers: [
		{
			provide: PG_POOL_APP,
			useFactory: (configService: ConfigService) =>
				new Pool({
					connectionString: configService.getOrThrow("DATABASE_URL"),
					max: 5,
					idleTimeoutMillis: 20_000,
					connectionTimeoutMillis: 10_000,
					allowExitOnIdle: true,
				}),
			inject: [ConfigService],
		},
		{
			provide: DBS.APP,
			useFactory: (pool: Pool) => drizzle(pool),
			inject: [PG_POOL_APP],
		},
		PgPoolShutdown,
	],
	exports: [DBS.APP, PG_POOL_APP],
})
export class DatabaseModule {}
