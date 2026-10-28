import { Module } from "@nestjs/common";
import { AuditsModule } from "../audits-service/audits.module";
import { AuthModule } from "../auth-service/auth.module";
import { UsersModule } from "../users-service/users.module";
import { BudgetController } from "./budget.controller";
import { BudgetService } from "./budget.service";

@Module({
	imports: [AuthModule, UsersModule, AuditsModule],
	controllers: [BudgetController],
	providers: [BudgetService],
})
export class BudgetModule {}
