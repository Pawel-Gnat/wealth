import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard.js";
import { userIdFromRequest } from "../guards/user-id-from-request.js";
import { BudgetService } from "./budget.service.js";

@Controller()
@UseGuards(SessionGuard)
export class BudgetController {
	constructor(private readonly budgetService: BudgetService) {}

	@Implement(rpcContract.budget.list)
	listBudgetsRpc() {
		return implement(rpcContract.budget.list).handler(({ context }) => {
			return this.budgetService.listBudgetsByUserId(
				userIdFromRequest(context.request),
			);
		});
	}

	@Implement(rpcContract.budget.invites)
	listBudgetInvitesRpc() {
		return implement(rpcContract.budget.invites).handler(({ context }) => {
			return this.budgetService.listInvitesByUserId(
				userIdFromRequest(context.request),
			);
		});
	}

	@Implement(rpcContract.budget.create)
	createBudgetRpc() {
		return implement(rpcContract.budget.create).handler(
			({ context, input }) => {
				return this.budgetService.createBudgetByUserId(
					userIdFromRequest(context.request),
					input,
				);
			},
		);
	}
}
