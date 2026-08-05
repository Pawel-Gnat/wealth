import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement, ORPCError } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { PassportJwtGuard } from "../guards/passport-jwt.guard.js";
import { getClientTimeZoneFromHeaders } from "../shared/time-zone/get-client-time-zone-from-headers.js";
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

				const timeZone = getClientTimeZoneFromHeaders(context.request.headers);

				return this.dashboardService.getWidgets(user.userId, timeZone);
			},
		);
	}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.dashboard.getCumulativeChart)
	getCumulativeChartRpc() {
		return implement(rpcContract.dashboard.getCumulativeChart).handler(
			({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				const timeZone = getClientTimeZoneFromHeaders(context.request.headers);

				return this.dashboardService.getCumulativeChart(
					user.userId,
					input.days,
					timeZone,
				);
			},
		);
	}

	@UseGuards(PassportJwtGuard)
	@Implement(rpcContract.dashboard.getDailyChart)
	getDailyChartRpc() {
		return implement(rpcContract.dashboard.getDailyChart).handler(
			({ context, input }) => {
				const user = context.request.user;
				if (!user?.userId) {
					throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
				}

				const timeZone = getClientTimeZoneFromHeaders(context.request.headers);

				return this.dashboardService.getDailyChart(
					user.userId,
					input.days,
					timeZone,
				);
			},
		);
	}
}
