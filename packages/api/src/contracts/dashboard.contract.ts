import { oc } from "@orpc/contract";
import {
	dashboardChartDaysInputSchema,
	dashboardChartResponseSchema,
	summaryResponseSchema,
} from "../schemas/dashboard.schema";

export const getDashboardSummaryContract = oc
	.route({ method: "GET", path: "/dashboard/summary" })
	.output(summaryResponseSchema);

export const getDashboardCumulativeChartContract = oc
	.route({ method: "GET", path: "/dashboard/cumulative-chart" })
	.input(dashboardChartDaysInputSchema)
	.output(dashboardChartResponseSchema);

export const getDashboardDailyChartContract = oc
	.route({ method: "GET", path: "/dashboard/daily-chart" })
	.input(dashboardChartDaysInputSchema)
	.output(dashboardChartResponseSchema);
