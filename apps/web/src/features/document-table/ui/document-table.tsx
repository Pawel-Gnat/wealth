import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentsList } from "@/features/document/api/use-documents-list";
import { getDocumentConfig } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { ErrorState, Table } from "@/shared/components";
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
