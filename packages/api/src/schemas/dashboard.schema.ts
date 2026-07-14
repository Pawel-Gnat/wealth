import { z } from "zod";
import { apiPayload } from "./common.schema";

export const chartPeriodSchema = z.enum(["month", "week"]).default("month");
export type ChartPeriod = z.infer<typeof chartPeriodSchema>;

export const dashboardChartInputSchema = z.object({
	chartPeriod: chartPeriodSchema,
});
export type DashboardChartInput = z.infer<typeof dashboardChartInputSchema>;

export const dashboardWidgetSchema = z.object({
	amount: z.number(),
	percentChange: z.number().nullable(),
});
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

export const dashboardWidgetsDataSchema = z.object({
	expenses: dashboardWidgetSchema,
	incomes: dashboardWidgetSchema,
	netBalance: dashboardWidgetSchema,
});
export type DashboardWidgetsData = z.infer<typeof dashboardWidgetsDataSchema>;

export const dashboardWidgetsResponseSchema = apiPayload(
	dashboardWidgetsDataSchema,
);
export type DashboardWidgetsResponse = z.infer<
	typeof dashboardWidgetsResponseSchema
>;

export const dashboardChartPointSchema = z.object({
	date: z.date(),
	expensesCumulative: z.number(),
	incomesCumulative: z.number(),
});
export type DashboardChartPoint = z.infer<typeof dashboardChartPointSchema>;

export const dashboardChartDataSchema = z.object({
	points: z.array(dashboardChartPointSchema),
});
export type DashboardChartData = z.infer<typeof dashboardChartDataSchema>;

export const dashboardChartResponseSchema = apiPayload(
	dashboardChartDataSchema,
);
export type DashboardChartResponse = z.infer<
	typeof dashboardChartResponseSchema
>;
