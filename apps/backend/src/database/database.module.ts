import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DBS, PG_POOL_APP } from "./constants.js";
import { PgPoolShutdown } from "./pg-pool.shutdown.js";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

@Global()
@Module({
	providers: [
		{
			provide: PG_POOL_APP,
			useFactory: () =>
				new Pool({
					connectionString: process.env.DATABASE_URL,
				}),
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
