import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { PassportJwtGuard } from "../guards/passport-jwt.guard.js";
import { DashboardService } from "./dashboard.service.js";

@Controller()
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.dashboard.getWidgets)
	getWidgetsRpc() {
		return implement(rpcContract.dashboard.getWidgets).handler(
			({ context }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				return this.dashboardService.getWidgets(user.userId);
			},
		);
	}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.dashboard.getChart)
	getChartRpc() {
		return implement(rpcContract.dashboard.getChart).handler(
			({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				return this.dashboardService.getChart(user.userId, input.chartPeriod);
			},
		);
	}
}
