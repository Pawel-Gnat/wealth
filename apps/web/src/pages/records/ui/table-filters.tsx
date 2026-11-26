import { recordListParamsSchema } from "@repo/api/schemas";
import { useTranslation } from "react-i18next";
import { Button, Select } from "@/shared/components";
import { useUrlPagination } from "@/shared/hooks/use-url-pagination/use-url-pagination";
import {
	readRecordDateRange,
	recordDateFilters,
} from "../helpers/record-date-range";
import { memberIdsParam } from "../helpers/record-members";
import { useRecordTypeFilter } from "../hooks/use-record-type-filter";
import { DateRangeFilter } from "./date-range-filter";
import { MemberFilter } from "./member-filter";

const recordTypeFilter = {
	type: recordListParamsSchema.shape.type,
	userIds: recordListParamsSchema.shape.userIds,
	...recordDateFilters,
};

type TableFiltersProps = {
	budgetId?: string;
};

export const TableFilters = ({ budgetId }: TableFiltersProps) => {
	const { t } = useTranslation();
	const { filters, setParams } = useUrlPagination(recordTypeFilter);
	const { typeOptions, typeValue, onTypeChange } = useRecordTypeFilter(
		filters.type,
		setParams,
	);
	const selectedUserIds = filters.userIds ?? [];
	const hasActiveFilters =
		Boolean(filters.type) ||
		Boolean(readRecordDateRange(filters)) ||
		selectedUserIds.length > 0;

	return (
		<div className="flex w-full flex-wrap items-end gap-3">
			<DateRangeFilter
				dateFrom={filters.dateFrom}
				dateTo={filters.dateTo}
				onRangeChange={(range) => {
					if (!range) {
						setParams({ page: 1, dateFrom: null, dateTo: null });
						return;
					}

					setParams({ page: 1, ...range });
				}}
			/>
			<Select
				className="w-full min-w-0 gap-1.5 xs:max-w-50 xs:min-w-30"
				label={t("list.filters.type.label", { ns: "records" })}
				value={typeValue}
				options={typeOptions}
				onValueChange={onTypeChange}
			/>
			{budgetId ? (
				<MemberFilter
					className="w-full min-w-0 gap-1.5 xs:max-w-64"
					budgetId={budgetId}
					value={selectedUserIds}
					onValueChange={(userIds) =>
						setParams({ page: 1, userIds: memberIdsParam(userIds) })
					}
				/>
			) : null}
			{hasActiveFilters ? (
				<Button
					className="ml-auto xs:ml-0"
					variant="destructive"
					onClick={() =>
						setParams({
							page: 1,
							type: null,
							userIds: null,
							dateFrom: null,
							dateTo: null,
						})
					}
				>
					{t("list.filters.clear", { ns: "records" })}
				</Button>
			) : null}
		</div>
	);
};
