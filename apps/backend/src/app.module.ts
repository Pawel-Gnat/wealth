import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { OrpcModule } from "./orpc/orpc.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [UsersModule, AuthModule, DatabaseModule, OrpcModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
