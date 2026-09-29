import { Module } from "@nestjs/common";
import { StorageModule } from "../storage-service/storage.module";
import { UsersService } from "./users.service";

@Module({
	imports: [StorageModule],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
