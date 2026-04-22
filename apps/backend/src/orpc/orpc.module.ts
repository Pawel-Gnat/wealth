import { Module } from "@nestjs/common";
import { OrpcController } from "./orpc.controller";
import { OrpcService } from "./orpc.service";

@Module({
	controllers: [OrpcController],
	providers: [OrpcService],
})
export class OrpcModule {}
