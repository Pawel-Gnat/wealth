import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module";
import { UsersModule } from "../users-service/users.module";
import { RecordsController } from "./records.controller";
import { RecordsService } from "./records.service";

@Module({
	imports: [AuthModule, UsersModule],
	controllers: [RecordsController],
	providers: [RecordsService],
	exports: [RecordsService],
})
export class RecordsModule {}
