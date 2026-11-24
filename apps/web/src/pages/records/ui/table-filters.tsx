import {
	recordListParamsSchema,
	recordTypeSchema,
	recordTypes,
} from "@repo/api/schemas";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/shared/components";
import { useUrlPagination } from "@/shared/hooks/use-url-pagination/use-url-pagination";

const ALL_RECORD_TYPES = "all";

const recordTypeFilter = {
	type: recordListParamsSchema.shape.type,
};

export const TableFilters = () => {
	const { t } = useTranslation();
	const { filters, setParams } = useUrlPagination(recordTypeFilter);

	const typeOptions = useMemo(
		() => [
			{
				value: ALL_RECORD_TYPES,
				label: t("list.all", { ns: "records" }),
			},
			...recordTypes.map((recordType) => ({
				value: recordType,
				label: t(`single.kind.${recordType}`, { ns: "records" }),
			})),
		],
		[t],
	);

	const onTypeChange = (value: string) => {
		if (value === ALL_RECORD_TYPES) {
			setParams({ page: 1, type: null });
			return;
		}

		const parsed = recordTypeSchema.safeParse(value);

		if (!parsed.success) return;

		setParams({ page: 1, type: parsed.data });
	};

	return (
		<Select
			className="max-w-50 w-full min-w-30 gap-1.5"
			label={t("list.type", { ns: "records" })}
			value={filters.type ?? ALL_RECORD_TYPES}
			options={typeOptions}
			onValueChange={onTypeChange}
		/>
	);
};
