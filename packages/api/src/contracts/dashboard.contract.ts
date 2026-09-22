import { oc } from "@orpc/contract";
import {
	dashboardChartResponseSchema,
	dashboardPeriodParamsSchema,
	summaryResponseSchema,
} from "../schemas/dashboard.schema";

export const getDashboardSummaryContract = oc
	.route({ method: "GET", path: "/dashboard/summary" })
	.input(dashboardPeriodParamsSchema)
	.output(summaryResponseSchema);

export const getDashboardCumulativeChartContract = oc
	.route({ method: "GET", path: "/dashboard/cumulative-chart" })
	.input(dashboardPeriodParamsSchema)
	.output(dashboardChartResponseSchema);

export const getDashboardDailyChartContract = oc
	.route({ method: "GET", path: "/dashboard/daily-chart" })
	.input(dashboardPeriodParamsSchema)
	.output(dashboardChartResponseSchema);
