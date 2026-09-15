import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard.js";
import { userIdFromRequest } from "../guards/user-id-from-request.js";
import { IncomesService } from "./incomes.service.js";

@Controller()
@UseGuards(SessionGuard)
export class IncomesController {
	constructor(private readonly incomesService: IncomesService) {}

	@Implement(rpcContract.incomes.list)
	listIncomeDocumentsRpc() {
		return implement(rpcContract.incomes.list).handler(({ context }) => {
			return this.incomesService.listIncomeDocumentsByUserId(
				userIdFromRequest(context.request),
			);
		});
	}

	@Implement(rpcContract.incomes.create)
	createIncomeRpc() {
		return implement(rpcContract.incomes.create).handler(
			({ context, input }) => {
				return this.incomesService.createIncomeByUserId(
					userIdFromRequest(context.request),
					input,
				);
			},
		);
	}

	@Implement(rpcContract.incomes.get)
	getIncomeRpc() {
		return implement(rpcContract.incomes.get).handler(
			async ({ context, input }) => {
				try {
					return await this.incomesService.getIncomeByUserId(
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

	@Implement(rpcContract.incomes.update)
	updateIncomeRpc() {
		return implement(rpcContract.incomes.update).handler(
			async ({ context, input }) => {
				try {
					const incomeId = input.id;
					if (incomeId === undefined) {
						throw new ORPCError("BAD_REQUEST", {
							message: "Income id is required",
						});
					}

					return await this.incomesService.updateIncomeByUserId(
						userIdFromRequest(context.request),
						incomeId,
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

	@Implement(rpcContract.incomes.delete)
	deleteIncomeRpc() {
		return implement(rpcContract.incomes.delete).handler(
			async ({ context, input }) => {
				try {
					return await this.incomesService.deleteIncomeByUserId(
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
