import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getDocumentConfig } from "@/features/config/document-config";
import { useDocument } from "@/features/document-form/hooks/use-document";
import type { RecordKind } from "@/features/model/record-kind";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { DocumentActions } from "./ui/document-actions";
import { DocumentDeleteDialog } from "./ui/document-delete-dialog";
import { DocumentView } from "./ui/document-view";

type DocumentProps = {
	kind: RecordKind;
};

export const Document = ({ kind }: DocumentProps) => {
	const { t } = useTranslation();
	const { id } = useParams();
	const config = getDocumentConfig(kind);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data, isLoading, isError } = useDocument({
		kind,
		...(id ? { documentId: id } : {}),
	});

	const title = t("single.title", { ns: config.i18nNamespace });
	const description = t("single.description", { ns: config.i18nNamespace });
	const errorTitle = t("single.error.title", { ns: config.i18nNamespace });
	const errorDescription = t("single.error.description", {
		ns: config.i18nNamespace,
	});

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

			{isDeleteOpen && (
				<DocumentDeleteDialog
					id={id}
					kind={kind}
					onClose={() => setIsDeleteOpen(false)}
				/>
			)}
		</PageLayout>
	);
};
