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

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.expenses.create)
	createExpenseRpc() {
		return implement(rpcContract.expenses.create).handler(
			({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				return this.expensesService.createExpenseByUserId(user.userId, input);
			},
		);
	}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.expenses.delete)
	deleteExpenseRpc() {
		return implement(rpcContract.expenses.delete).handler(
			async ({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				try {
					return await this.expensesService.deleteExpenseByUserId(
						user.userId,
						input.id,
					);
				} catch (error) {
					if (error instanceof Error) {
						throw new ORPCError("NOT_FOUND", { message: error.message });
					}
					throw error;
				}
			},
		);
	}
}
