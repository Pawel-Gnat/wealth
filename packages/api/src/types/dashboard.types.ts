import type { z } from "zod";
import type {
	dashboardChartDataSchema,
	dashboardChartPointSchema,
	dashboardChartResponseSchema,
	dashboardPeriodParamsSchema,
	periodValues,
	summaryDataSchema,
	summaryKindSchema,
	summaryResponseSchema,
	summarySchema,
} from "../schemas/dashboard.schema";

export type Period = (typeof periodValues)[number];
export type DashboardPeriodParams = z.infer<typeof dashboardPeriodParamsSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type SummaryData = z.infer<typeof summaryDataSchema>;
export type SummaryKind = z.infer<typeof summaryKindSchema>;
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;
export type DashboardChartPoint = z.infer<typeof dashboardChartPointSchema>;
export type DashboardChartData = z.infer<typeof dashboardChartDataSchema>;
export type DashboardChartResponse = z.infer<
	typeof dashboardChartResponseSchema
>;
