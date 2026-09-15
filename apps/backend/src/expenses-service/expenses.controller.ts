import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard.js";
import { userIdFromRequest } from "../guards/user-id-from-request.js";
import { ExpensesService } from "./expenses.service.js";

@Controller()
@UseGuards(SessionGuard)
export class ExpensesController {
	constructor(private readonly expensesService: ExpensesService) {}

	@Implement(rpcContract.expenses.list)
	listExpenseDocumentsRpc() {
		return implement(rpcContract.expenses.list).handler(({ context }) => {
			return this.expensesService.listExpenseDocumentsByUserId(
				userIdFromRequest(context.request),
			);
		});
	}

	@Implement(rpcContract.expenses.create)
	createExpenseRpc() {
		return implement(rpcContract.expenses.create).handler(
			({ context, input }) => {
				return this.expensesService.createExpenseByUserId(
					userIdFromRequest(context.request),
					input,
				);
			},
		);
	}

	@Implement(rpcContract.expenses.get)
	getExpenseRpc() {
		return implement(rpcContract.expenses.get).handler(
			async ({ context, input }) => {
				try {
					return await this.expensesService.getExpenseByUserId(
						userIdFromRequest(context.request),
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

	@Implement(rpcContract.expenses.update)
	updateExpenseRpc() {
		return implement(rpcContract.expenses.update).handler(
			async ({ context, input }) => {
				try {
					const expenseId = input.id;
					if (expenseId === undefined) {
						throw new ORPCError("BAD_REQUEST", {
							message: "Expense id is required",
						});
					}

					return await this.expensesService.updateExpenseByUserId(
						userIdFromRequest(context.request),
						expenseId,
						{ date: input.date, lineItems: input.lineItems },
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

	@Implement(rpcContract.expenses.delete)
	deleteExpenseRpc() {
		return implement(rpcContract.expenses.delete).handler(
			async ({ context, input }) => {
				try {
					return await this.expensesService.deleteExpenseByUserId(
						userIdFromRequest(context.request),
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
