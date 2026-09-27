import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../database-service/database.module";
import { UsersModule } from "../users-service/users.module";

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
