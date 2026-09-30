import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard";
import { userIdFromRequest } from "../guards/user-id-from-request";
import { RecordsService } from "../records-service/records.service";
import { BudgetService } from "./budget.service";

@Controller()
@UseGuards(SessionGuard)
export class BudgetController {
	constructor(
		private readonly budgetService: BudgetService,
		private readonly recordsService: RecordsService,
	) {}

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

	@Implement(rpcContract.budget.documents)
	listBudgetDocumentsRpc() {
		return implement(rpcContract.budget.documents).handler(
			({ context, input }) => {
				return this.recordsService.listByBudgetId(
					userIdFromRequest(context.request),
					input.id,
					input.kind,
				);
			},
		);
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
