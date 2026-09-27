import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module.js";
import { BudgetController } from "./budget.controller.js";
import { BudgetService } from "./budget.service.js";

@Module({
	imports: [AuthModule],
	controllers: [BudgetController],
	providers: [BudgetService],
})
export class BudgetModule {}
