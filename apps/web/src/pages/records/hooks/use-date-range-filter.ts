import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import {
	formatRecordDateRangeLabel,
	orderDateRange,
	type RecordDateRange,
	readRecordDateRange,
	toCalendarDate,
	toDateParam,
} from "../helpers/record-date-range";

type UseDateRangeFilterProps = {
	dateFrom?: string | undefined;
	dateTo?: string | undefined;
	onRangeChange: (range: RecordDateRange | null) => void;
};

export const useDateRangeFilter = ({
	dateFrom,
	dateTo,
	onRangeChange,
}: UseDateRangeFilterProps) => {
	const { t, i18n } = useTranslation();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<DateRange | undefined>();

	const range = readRecordDateRange({ dateFrom, dateTo });
	const from = range ? toCalendarDate(range.dateFrom) : undefined;
	const to = range ? toCalendarDate(range.dateTo) : undefined;
	const committed = from && to ? { from, to } : undefined;
	const selected = draft ?? committed;
	const shownFrom = draft?.from ?? (draft ? undefined : from);
	const shownTo = draft?.from ? draft.to : to;
	const label = shownFrom
		? shownTo
			? `${formatRecordDateRangeLabel(shownFrom, i18n.language)} – ${formatRecordDateRangeLabel(shownTo, i18n.language)}`
			: formatRecordDateRangeLabel(shownFrom, i18n.language)
		: t("list.filters.date.placeholder", { ns: "records" });

	const onOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setDraft(undefined);
	};

	const onSelect = (next: DateRange | undefined) => {
		if (!next?.from || !next.to) {
			setDraft(next);
			return;
		}

		onRangeChange(orderDateRange(toDateParam(next.from), toDateParam(next.to)));
		setDraft(undefined);
		setOpen(false);
	};

	return {
		open,
		onOpenChange,
		label,
		selected,
		onSelect,
	};
};
