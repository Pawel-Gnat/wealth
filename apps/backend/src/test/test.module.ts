import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../database/database.module.js";
import { UsersModule } from "../users/users.module.js";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			ignoreEnvFile: true,
		}),
		DatabaseModule,
		UsersModule,
	],
	exports: [UsersModule],
})
export class TestModule {}
