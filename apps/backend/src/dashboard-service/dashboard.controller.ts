import { Controller, UseGuards } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { rpcContract } from "@repo/api/contracts";
import { SessionGuard } from "../guards/session.guard.js";
import { userIdFromRequest } from "../guards/user-id-from-request.js";
import { getClientTimeZoneFromHeaders } from "../shared/time-zone/get-client-time-zone-from-headers.js";
import { DashboardService } from "./dashboard.service.js";

@Controller()
@UseGuards(SessionGuard)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Implement(rpcContract.dashboard.getSummary)
	getSummaryRpc() {
		return implement(rpcContract.dashboard.getSummary).handler(
			({ context }) => {
				const timeZone = getClientTimeZoneFromHeaders(context.request.headers);

				return this.dashboardService.getSummary(
					userIdFromRequest(context.request),
					timeZone,
				);
			},
		);
	}

	@Implement(rpcContract.dashboard.getCumulativeChart)
	getCumulativeChartRpc() {
		return implement(rpcContract.dashboard.getCumulativeChart).handler(
			({ context, input }) => {
				const timeZone = getClientTimeZoneFromHeaders(context.request.headers);

				return this.dashboardService.getCumulativeChart(
					userIdFromRequest(context.request),
					input.days,
					timeZone,
				);
			},
		);
	}

	@Implement(rpcContract.dashboard.getDailyChart)
	getDailyChartRpc() {
		return implement(rpcContract.dashboard.getDailyChart).handler(
			({ context, input }) => {
				const timeZone = getClientTimeZoneFromHeaders(context.request.headers);

				return this.dashboardService.getDailyChart(
					userIdFromRequest(context.request),
					input.days,
					timeZone,
				);
			},
		);
	}
}
