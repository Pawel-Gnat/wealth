import {
	type ChartPeriod,
	chartPeriodSchema,
	chartPeriodValues,
} from "@repo/api/schemas";

export type { ChartPeriod };
export { chartPeriodSchema, chartPeriodValues };

export const DEFAULT_CHART_PERIOD = "month" satisfies ChartPeriod;
