import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { APP_ROUTES } from "@/app/routes";
import { ErrorState, Table } from "@/shared/components";
import { recordColumns } from "../config/record-columns";
import { useRecordsList } from "../hooks/use-records-list";

export const RecordTable = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useRecordsList();

	const columns = useMemo(
		() =>
			recordColumns({
				t,
				language: i18n.language,
				getViewPath: APP_ROUTES.records.view,
			}),
		[i18n.language, t],
	);

	if (isError) {
		return (
			<ErrorState
				title={t("list.error.title", { ns: "records" })}
				description={t("list.error.description", { ns: "records" })}
			/>
		);
	}

	return (
		<Table
			columns={columns}
			data={data}
			noResultsTitle={t("list.empty.title", { ns: "records" })}
			noResultsDescription={t("list.empty.description", { ns: "records" })}
			noResultsIcon="money"
			isLoading={isLoading}
		/>
	);
};
