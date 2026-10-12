import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getDocumentConfig } from "@/features/config/document-config";
import { useDocument } from "@/features/document-form/hooks/use-document";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { RecordActions } from "./ui/record-actions";
import { RecordDeleteDialog } from "./ui/record-delete-dialog";
import { RecordView } from "./ui/record-view";

export const RecordPage = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data, isLoading, isError } = useDocument({
		...(id ? { documentId: id } : {}),
	});
	const kind = data?.kind ?? "expense";
	const config = getDocumentConfig(kind);

	const title = t("single.title", { ns: "records" });
	const description = t("single.description", { ns: "records" });
	const errorTitle = t("single.error.title", { ns: "records" });
	const errorDescription = t("single.error.description", { ns: "records" });

	if (!id) {
		return null;
	}

	return (
		<PageLayout title={title} subtitle={description}>
			<CardState
				data={data}
				isError={isError}
				isLoading={isLoading}
				errorTitle={errorTitle}
				errorDescription={errorDescription}
				skeletonClassName="h-100"
				actions={
					<RecordActions
						editPath={config.editRoute(id)}
						isLoading={isLoading}
						isReady={Boolean(data)}
						onDelete={() => setIsDeleteOpen(true)}
					/>
				}
			>
				{(record) => <RecordView record={record} />}
			</CardState>

			{isDeleteOpen && data ? (
				<RecordDeleteDialog
					id={id}
					kind={data.kind}
					onClose={() => setIsDeleteOpen(false)}
				/>
			) : null}
		</PageLayout>
	);
};
