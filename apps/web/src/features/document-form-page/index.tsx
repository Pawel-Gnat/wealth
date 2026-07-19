import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Card, ErrorState, Heading } from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import type { RecordKind } from "@/shared/types/record-kind";
import { useDocument } from "./hooks/use-document";
import { DocumentForm } from "./ui/document-form";
import { DocumentFormSkeleton } from "./ui/document-form-skeleton";

type DocumentFormPageProps = {
	kind: RecordKind;
};

export function DocumentFormPage({ kind }: DocumentFormPageProps) {
	const { t } = useTranslation();
	const { id } = useParams();
	const config = getDocumentConfig(kind);
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useDocument({
		kind,
		...(id ? { documentId: id } : {}),
	});

	if (isEditMode && isLoading) {
		return (
			<>
				<Heading>
					{t("single.title-edit", { ns: config.i18nNamespace })}
				</Heading>
				<Card content={<DocumentFormSkeleton />} />
			</>
		);
	}

	if (isEditMode && (isError || !data)) {
		return (
			<>
				<Heading>
					{t("single.title-edit", { ns: config.i18nNamespace })}
				</Heading>
				<Card
					content={
						<ErrorState text={t("list.error", { ns: config.i18nNamespace })} />
					}
				/>
			</>
		);
	}

	return (
		<>
			<Heading>
				{isEditMode
					? t("single.title-edit", { ns: config.i18nNamespace })
					: t("single.title-create", { ns: config.i18nNamespace })}
			</Heading>
			<Card
				content={
					<DocumentForm
						kind={kind}
						{...(id ? { documentId: id } : {})}
						{...(data ? { initialValues: data } : {})}
					/>
				}
			/>
		</>
	);
}
