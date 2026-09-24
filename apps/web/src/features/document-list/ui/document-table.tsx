import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { ErrorState, Table } from "@/shared/components";
import { documentColumns } from "../config/document-columns";
import { useDocumentsList } from "../hooks/use-documents-list";

type DocumentTableProps = {
	kind: RecordKind;
};

export const DocumentTable = ({ kind }: DocumentTableProps) => {
	const config = getDocumentConfig(kind);
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDocumentsList(kind);

	const columns = useMemo(
		() =>
			documentColumns({
				t,
				language: i18n.language,
				getViewPath: config.viewRoute,
			}),
		[config.viewRoute, i18n.language, t],
	);

	if (isError) {
		return (
			<ErrorState
				title={t("list.error.title", { ns: config.i18nNamespace })}
				description={t("list.error.description", { ns: config.i18nNamespace })}
			/>
		);
	}

	return (
		<Table
			columns={columns}
			data={data}
			noResultsTitle={t("list.empty.title", { ns: config.i18nNamespace })}
			noResultsDescription={t("list.empty.description", {
				ns: config.i18nNamespace,
			})}
			noResultsIcon={config.i18nNamespace === "expenses" ? "expense" : "income"}
			isLoading={isLoading}
		/>
	);
};
