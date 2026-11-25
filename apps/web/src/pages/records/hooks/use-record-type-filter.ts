import { recordTypeSchema, recordTypes } from "@repo/api/schemas";
import type { RecordType } from "@repo/api/types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const ALL_RECORD_TYPES = "all";

type SetRecordType = (values: {
	page: number;
	type: RecordType | null;
}) => void;

export const useRecordTypeFilter = (
	type: RecordType | undefined,
	setParams: SetRecordType,
) => {
	const { t } = useTranslation();
	const typeOptions = useMemo(
		() => [
			{
				value: ALL_RECORD_TYPES,
				label: t("list.filters.type.all", { ns: "records" }),
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

	return {
		typeOptions,
		typeValue: type ?? ALL_RECORD_TYPES,
		onTypeChange,
	};
};
