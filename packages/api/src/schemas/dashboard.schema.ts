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

export const summarySchema = z.object({
	amount: z.number(),
	percentChange: z.number().nullable(),
});
export type Summary = z.infer<typeof summarySchema>;

const summaryDataShape = {
	expenses: summarySchema,
	incomes: summarySchema,
	netBalance: summarySchema,
} as const;

export const summaryDataSchema = z.object(summaryDataShape);
export type SummaryData = z.infer<typeof summaryDataSchema>;

export const summaryKindSchema = summaryDataSchema.keyof();
export type SummaryKind = z.infer<typeof summaryKindSchema>;
export const summaryKinds = summaryKindSchema.options;

export const summaryResponseSchema = apiPayload(summaryDataSchema);
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;

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
