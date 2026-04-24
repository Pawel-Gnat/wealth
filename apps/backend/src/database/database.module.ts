import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DBS, PG_POOL_APP } from "./constants.js";
import { PgPoolShutdown } from "./pg-pool.shutdown.js";
import { ConfigService } from "@nestjs/config";



@Global()
@Module({
	providers: [
		{
			provide: PG_POOL_APP,
			useFactory: (configService: ConfigService) =>
				new Pool({
					connectionString: configService.getOrThrow("DATABASE_URL"),
				}),
				inject: [ ConfigService],
		},
		{
			provide: DBS.APP,
			useFactory: (pool: Pool) => drizzle(pool),
			inject: [PG_POOL_APP],
		},
		PgPoolShutdown,
	],
	exports: [DBS.APP],
})
export class DatabaseModule {}
