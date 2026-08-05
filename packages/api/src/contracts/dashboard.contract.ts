import { oc } from "@orpc/contract";
import {
	dashboardChartDaysInputSchema,
	dashboardChartResponseSchema,
	dashboardWidgetsResponseSchema,
} from "../schemas/dashboard.schema";

export const getDashboardWidgetsContract = oc
	.route({ method: "GET", path: "/dashboard/widgets" })
	.output(dashboardWidgetsResponseSchema);

export const getDashboardCumulativeChartContract = oc
	.route({ method: "GET", path: "/dashboard/cumulative-chart" })
	.input(dashboardChartDaysInputSchema)
	.output(dashboardChartResponseSchema);

export const getDashboardDailyChartContract = oc
	.route({ method: "GET", path: "/dashboard/daily-chart" })
	.input(dashboardChartDaysInputSchema)
	.output(dashboardChartResponseSchema);
