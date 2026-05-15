import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { PassportJwtGuard } from "../guards/passport-jwt.guard.js";
import { IncomesService } from "./incomes.service.js";

@Controller()
export class IncomesController {
	constructor(private readonly incomesService: IncomesService) {}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.incomes.list)
	listIncomeDocumentsRpc() {
		return implement(rpcContract.incomes.list).handler(({ context }) => {
			const user = context.request.user;
			if (!user?.userId) {
				throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
			}

			return this.incomesService.listIncomeDocumentsByUserId(user.userId);
		});
	}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.incomes.create)
	createIncomeRpc() {
		return implement(rpcContract.incomes.create).handler(
			({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				return this.incomesService.createIncomeByUserId(user.userId, input);
			},
		);
	}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.incomes.get)
	getIncomeRpc() {
		return implement(rpcContract.incomes.get).handler(
			async ({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				try {
					return await this.incomesService.getIncomeByUserId(
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

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.incomes.update)
	updateIncomeRpc() {
		return implement(rpcContract.incomes.update).handler(
			async ({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}
				try {
					const incomeId = input.id;
					if (incomeId === undefined) {
						throw new ORPCError("BAD_REQUEST", {
							message: "Income id is required",
						});
					}

					return await this.incomesService.updateIncomeByUserId(
						user.userId,
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

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.incomes.delete)
	deleteIncomeRpc() {
		return implement(rpcContract.incomes.delete).handler(
			async ({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				try {
					return await this.incomesService.deleteIncomeByUserId(
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
