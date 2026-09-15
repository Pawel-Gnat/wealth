import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module.js";
import { IncomesController } from "./incomes.controller.js";
import { IncomesService } from "./incomes.service.js";

@Module({
	imports: [AuthModule],
	controllers: [IncomesController],
	providers: [IncomesService],
})
export class IncomesModule {}
