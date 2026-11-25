import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/shared/components";
import { Calendar } from "@/shared/lib/ui/calendar";
import { Field, FieldLabel } from "@/shared/lib/ui/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/lib/ui/popover";
import type { RecordDateRange } from "../helpers/record-date-range";
import { useDateRangeFilter } from "../hooks/use-date-range-filter";

type DateRangeFilterProps = {
	dateFrom?: string | undefined;
	dateTo?: string | undefined;
	onRangeChange: (range: RecordDateRange | null) => void;
};

export const DateRangeFilter = ({
	dateFrom,
	dateTo,
	onRangeChange,
}: DateRangeFilterProps) => {
	const { t } = useTranslation();
	const labelId = useId();
	const valueId = useId();
	const id = useId();
	const { open, onOpenChange, label, selected, onSelect } = useDateRangeFilter({
		dateFrom,
		dateTo,
		onRangeChange,
	});

	return (
		<Field className="w-full gap-1.5 xs:max-w-64">
			<FieldLabel id={labelId} htmlFor={id}>
				{t("list.filters.date.label", { ns: "records" })}
			</FieldLabel>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="input"
						className="w-full justify-start"
						aria-labelledby={`${labelId} ${valueId}`}
					>
						<Icon name="calendar" />
						<span id={valueId}>{label}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="range"
						resetOnSelect
						selected={selected}
						onSelect={onSelect}
						{...(selected?.from ? { defaultMonth: selected.from } : {})}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};
