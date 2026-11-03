import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module";
import { AuditsController } from "./audits.controller";
import { AuditsService } from "./audits.service";

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [AuditsController],
	providers: [AuditsService],
	exports: [AuditsService],
})
export class AuditsModule {}
