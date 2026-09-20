import { S3Client } from "@aws-sdk/client-s3";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "../auth-service/auth.module.js";
import { S3_CLIENT } from "./constants.js";
import { StorageController } from "./storage.controller.js";
import { StorageService } from "./storage.service.js";

@Global()
@Module({
	imports: [AuthModule],
	controllers: [StorageController],
	providers: [
		{
			provide: S3_CLIENT,
			useFactory: (configService: ConfigService) =>
				new S3Client({
					region: configService.getOrThrow<string>("STORAGE_REGION"),
					endpoint: configService.getOrThrow<string>("STORAGE_ENDPOINT"),
					forcePathStyle:
						configService.get<string>("STORAGE_FORCE_PATH_STYLE") === "true",
					credentials: {
						accessKeyId: configService.getOrThrow<string>("STORAGE_ACCESS_KEY"),
						secretAccessKey:
							configService.getOrThrow<string>("STORAGE_SECRET_KEY"),
					},
				}),
			inject: [ConfigService],
		},
		StorageService,
	],
	exports: [StorageService],
})
export class StorageModule {}
