import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { BudgetService } from "./budget.service";

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

	@Implement(rpcContract.budget.update)
	updateBudgetRpc() {
		return implement(rpcContract.budget.update).handler(
			({ context, input }) => {
				return this.budgetService.updateBudgetByUserId(
					userIdFromRequest(context.request),
					input,
				);
			},
		);
	}

	@Implement(rpcContract.budget.inviteMembers)
	inviteBudgetMembersRpc() {
		return implement(rpcContract.budget.inviteMembers).handler(
			({ context, input }) => {
				return this.budgetService.inviteMembersByUserId(
					userIdFromRequest(context.request),
					input,
				);
			},
		);
	}

	@Implement(rpcContract.budget.delete)
	deleteBudgetRpc() {
		return implement(rpcContract.budget.delete).handler(
			({ context, input }) => {
				return this.budgetService.deleteBudgetByUserId(
					userIdFromRequest(context.request),
					input.id,
				);
			},
		);
	}

	@Implement(rpcContract.budget.leave)
	leaveBudgetRpc() {
		return implement(rpcContract.budget.leave).handler(({ context, input }) => {
			return this.budgetService.leaveBudgetByUserId(
				userIdFromRequest(context.request),
				input.id,
			);
		});
	}
}
