import { recordListParamsSchema } from "@repo/api/schemas";
import {
	requireOrderedParams,
	textFilter,
} from "@/shared/hooks/use-url-pagination/utils/url-pagination";

export const recordDateFilters = {
	dateFrom: textFilter(recordListParamsSchema.shape.dateFrom),
	dateTo: textFilter(recordListParamsSchema.shape.dateTo),
};

export const recordDateRangeRelation = requireOrderedParams(
	"dateFrom",
	"dateTo",
	(from, to) => from.localeCompare(to),
);

export type RecordDateRange = {
	dateFrom: string;
	dateTo: string;
};

export const toCalendarDate = (value: string) => {
	const [year, month, day] = value.split("-").map(Number);

	if (!year || !month || !day) return;

	return new Date(year, month - 1, day);
};

export const toDateParam = (date: Date) => {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${date.getFullYear()}-${month}-${day}`;
};

export const readRecordDateRange = (filters: {
	dateFrom?: string | undefined;
	dateTo?: string | undefined;
}): RecordDateRange | undefined => {
	const { dateFrom, dateTo } = filters;

	if (!dateFrom || !dateTo || dateFrom > dateTo) return;

	return { dateFrom, dateTo };
};

export const formatRecordDateRangeLabel = (date: Date, language: string) => {
	return date.toLocaleDateString(language, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

export const orderDateRange = (start: string, end: string): RecordDateRange => {
	if (start <= end) return { dateFrom: start, dateTo: end };

	return { dateFrom: end, dateTo: start };
};
