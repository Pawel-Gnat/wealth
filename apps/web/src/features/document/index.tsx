import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getDocumentConfig } from "@/features/config/document-config";
import { useDocument } from "@/features/document-form/hooks/use-document";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { DocumentActions } from "./ui/document-actions";
import { DocumentDeleteDialog } from "./ui/document-delete-dialog";
import { DocumentView } from "./ui/document-view";

export const Document = () => {
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
					<DocumentActions
						editPath={config.editRoute(id)}
						isLoading={isLoading}
						isReady={Boolean(data)}
						onDelete={() => setIsDeleteOpen(true)}
					/>
				}
			>
				{(document) => <DocumentView document={document} />}
			</CardState>

			{isDeleteOpen && data ? (
				<DocumentDeleteDialog
					id={id}
					kind={data.kind}
					onClose={() => setIsDeleteOpen(false)}
				/>
			) : null}
		</PageLayout>
	);
};
