import { z } from "zod";
import { apiPayload } from "./common.schema";

export const DEFAULT_CHART_DAYS = 30;
export const chartDaysValues = [7, DEFAULT_CHART_DAYS] as const;
export type ChartDays = (typeof chartDaysValues)[number];

export const chartDaysEnumSchema = z.coerce
	.number()
	.pipe(z.literal(chartDaysValues));
export const chartDaysSchema = chartDaysEnumSchema.default(DEFAULT_CHART_DAYS);

export const dashboardChartDaysInputSchema = z.object({
	days: chartDaysSchema,
});
export type DashboardChartDaysInput = z.infer<
	typeof dashboardChartDaysInputSchema
>;

export const dashboardWidgetSchema = z.object({
	amount: z.number(),
	percentChange: z.number().nullable(),
});
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

const dashboardWidgetsDataShape = {
	expenses: dashboardWidgetSchema,
	incomes: dashboardWidgetSchema,
	netBalance: dashboardWidgetSchema,
} as const;

export const dashboardWidgetsDataSchema = z.object(dashboardWidgetsDataShape);
export type DashboardWidgetsData = z.infer<typeof dashboardWidgetsDataSchema>;

export const dashboardWidgetKindSchema = dashboardWidgetsDataSchema.keyof();
export type DashboardWidgetKind = z.infer<typeof dashboardWidgetKindSchema>;
export const dashboardWidgetKinds = dashboardWidgetKindSchema.options;

export const dashboardWidgetsResponseSchema = apiPayload(
	dashboardWidgetsDataSchema,
);
export type DashboardWidgetsResponse = z.infer<
	typeof dashboardWidgetsResponseSchema
>;

export const dashboardChartPointSchema = z.object({
	date: z.coerce.date(),
	expenses: z.number(),
	incomes: z.number(),
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
