import { z } from "zod";
import { apiPayload } from "./common.schema";

export const DEFAULT_PERIOD = 30;
export const periodValues = [7, DEFAULT_PERIOD] as const;

export const periodEnumSchema = z.coerce.number().pipe(z.literal(periodValues));
export const periodSchema = periodEnumSchema.default(DEFAULT_PERIOD);

export const dashboardPeriodInputSchema = z.object({
	days: periodSchema,
});

export const summarySchema = z.object({
	amount: z.number(),
	percentChange: z.number().nullable(),
});

const summaryDataShape = {
	expenses: summarySchema,
	incomes: summarySchema,
	netBalance: summarySchema,
} as const;

export const summaryDataSchema = z.object(summaryDataShape);

export const summaryKindSchema = summaryDataSchema.keyof();
export const summaryKinds = summaryKindSchema.options;

export const summaryResponseSchema = apiPayload(summaryDataSchema);

export const dashboardChartPointSchema = z.object({
	date: z.coerce.date(),
	expenses: z.number(),
	incomes: z.number(),
});

export const dashboardChartDataSchema = z.object({
	points: z.array(dashboardChartPointSchema),
});

export const dashboardChartResponseSchema = apiPayload(
	dashboardChartDataSchema,
);
