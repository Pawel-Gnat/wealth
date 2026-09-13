import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Card } from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import { PageLayout } from "@/shared/layouts";
import type { RecordKind } from "@/shared/types/record-kind";
import { CardState } from "@/shared/widgets/card-state";
import { useDocument } from "./hooks/use-document";
import { DocumentForm as DocumentFormUI } from "./ui/document-form";

type DocumentFormProps = {
	kind: RecordKind;
};

export function DocumentForm({ kind }: DocumentFormProps) {
	const { t } = useTranslation();
	const { id } = useParams();
	const config = getDocumentConfig(kind);
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useDocument({
		kind,
		...(id ? { documentId: id } : {}),
	});

	const title = isEditMode
		? t("single.title-edit", { ns: config.i18nNamespace })
		: t("single.title-create", { ns: config.i18nNamespace });
	const description = isEditMode
		? t("single.description-edit", { ns: config.i18nNamespace })
		: t("single.description-create", { ns: config.i18nNamespace });
	const errorTitle = t("single.error.title", { ns: config.i18nNamespace });
	const errorDescription = t("single.error.description", {
		ns: config.i18nNamespace,
	});

	return (
		<PageLayout title={title} subtitle={description}>
			{isEditMode ? (
				<CardState
					data={data}
					isError={isError}
					isLoading={isLoading}
					errorTitle={errorTitle}
					errorDescription={errorDescription}
					skeletonClassName="h-100"
				>
					{(document) => (
						<DocumentFormUI
							kind={kind}
							{...(id ? { documentId: id } : {})}
							initialValues={document}
						/>
					)}
				</CardState>
			) : (
				<Card>
					<DocumentFormUI kind={kind} />
				</Card>
			)}
		</PageLayout>
	);
}
