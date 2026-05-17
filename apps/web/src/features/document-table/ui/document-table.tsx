import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDeleteDocument } from "@/features/document/api/use-delete-document";
import { useDocumentsList } from "@/features/document/api/use-documents-list";
import { getDocumentConfig } from "@/features/document/model/document-config";
import type { RecordKind } from "@/features/document/model/record-kind";
import { ErrorState, Table } from "@/shared/components";
import { createDocumentColumns } from "./create-document-columns";

type DocumentTableProps = {
	kind: RecordKind;
};

export const DocumentTable = ({ kind }: DocumentTableProps) => {
	const config = getDocumentConfig(kind);
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useDocumentsList(kind);
	const {
		deleteDocument,
		deletingDocumentId,
		isLoading: isDeleting,
	} = useDeleteDocument({
		kind,
		onSuccess: () => {
			toast.success(t(config.toast.deleted, { ns: "common" }));
		},
		onError: () => {
			toast.error(t(config.toast.deleteError, { ns: "common" }));
		},
	});

	const columns = useMemo(
		() =>
			createDocumentColumns({
				t,
				language: i18n.language,
				getEditPath: config.editRoute,
				onDelete: deleteDocument,
				deletingDocumentId,
				isDeleting,
			}),
		[
			config.editRoute,
			deleteDocument,
			deletingDocumentId,
			i18n.language,
			isDeleting,
			t,
		],
	);

	if (isError) {
		return <ErrorState text={t("list.error", { ns: config.i18nNamespace })} />;
	}

	return (
		<Table
			columns={columns}
			data={data}
			noResultsText={t("list.no-results", { ns: config.i18nNamespace })}
			isLoading={isLoading}
		/>
	);
};
