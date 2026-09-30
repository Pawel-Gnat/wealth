import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module";
import { RecordsModule } from "../records-service/records.module";
import { UsersModule } from "../users-service/users.module";
import { BudgetController } from "./budget.controller";
import { BudgetService } from "./budget.service";

@Module({
	imports: [AuthModule, UsersModule, RecordsModule],
	controllers: [BudgetController],
	providers: [BudgetService],
})
export class BudgetModule {}
