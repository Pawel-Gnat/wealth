import { Module } from "@nestjs/common";
import { AuthModule } from "../auth-service/auth.module.js";
import { ExpensesController } from "./expenses.controller.js";
import { ExpensesService } from "./expenses.service.js";

@Module({
	imports: [AuthModule],
	controllers: [ExpensesController],
	providers: [ExpensesService],
})
export class ExpensesModule {}
