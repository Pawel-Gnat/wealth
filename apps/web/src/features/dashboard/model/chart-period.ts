import { type ChartPeriod, chartPeriodSchema } from "@repo/api/schemas";

export type { ChartPeriod };
export { chartPeriodSchema };

export const DEFAULT_CHART_PERIOD = "month" satisfies ChartPeriod;
