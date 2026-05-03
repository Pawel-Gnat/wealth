import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { PassportJwtGuard } from "../guards/passport-jwt.guard.js";
import { ExpensesService } from "./expenses.service.js";

@Controller()
export class ExpensesController {
	constructor(private readonly expensesService: ExpensesService) {}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.expenses.list)
	listExpenseDocumentsRpc() {
		return implement(rpcContract.expenses.list).handler(({ context }) => {
			const user = context.request.user;
			if (!user?.userId) {
				throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
			}

			return this.expensesService.listExpenseDocumentsByUserId(user.userId);
		});
	}
}
