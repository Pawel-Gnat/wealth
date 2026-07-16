import { oc } from "@orpc/contract";
import {
	dashboardChartInputSchema,
	dashboardChartResponseSchema,
	dashboardWidgetsResponseSchema,
} from "../schemas/dashboard.schema";

export const getDashboardWidgetsContract = oc
	.route({ method: "GET", path: "/dashboard/widgets" })
	.output(dashboardWidgetsResponseSchema);

export const getDashboardChartContract = oc
	.route({ method: "GET", path: "/dashboard/chart" })
	.input(dashboardChartInputSchema)
	.output(dashboardChartResponseSchema);
