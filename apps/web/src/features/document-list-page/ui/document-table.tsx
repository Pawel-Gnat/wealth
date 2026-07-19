import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ErrorState, Table } from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import type { RecordKind } from "@/shared/types/record-kind";
import { useDocumentsList } from "../hooks/use-documents-list";
import { createDocumentColumns } from "./create-document-columns";
import { DocumentDeleteDialog } from "./document-delete-dialog";

type DocumentTableProps = {
	kind: RecordKind;
};

export const DocumentTable = ({ kind }: DocumentTableProps) => {
	const config = getDocumentConfig(kind);
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDocumentsList(kind);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

	const columns = useMemo(
		() =>
			createDocumentColumns({
				t,
				language: i18n.language,
				getEditPath: config.editRoute,
				onDelete: setPendingDeleteId,
			}),
		[config.editRoute, i18n.language, t],
	);

	if (isError) {
		return <ErrorState text={t("list.error", { ns: config.i18nNamespace })} />;
	}

	return (
		<>
			<Table
				columns={columns}
				data={data}
				noResultsText={t("list.no-results", { ns: config.i18nNamespace })}
				isLoading={isLoading}
			/>
			{pendingDeleteId && (
				<DocumentDeleteDialog
					id={pendingDeleteId}
					kind={kind}
					onClose={() => {
						setPendingDeleteId(null);
					}}
				/>
			)}
		</>
	);
};
