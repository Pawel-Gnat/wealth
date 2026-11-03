import { Module } from "@nestjs/common";
import { AuditsModule } from "../audit-service/audits.module";
import { AuthModule } from "../auth-service/auth.module";
import { NotificationsModule } from "../notification-service/notifications.module";
import { UsersModule } from "../users-service/users.module";
import { BudgetController } from "./budget.controller";
import { BudgetService } from "./budget.service";

@Module({
	imports: [AuthModule, UsersModule, AuditsModule, NotificationsModule],
	controllers: [BudgetController],
	providers: [BudgetService],
})
export class BudgetModule {}
