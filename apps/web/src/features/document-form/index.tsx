import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Card } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { useDocument } from "./hooks/use-document";
import { DocumentForm as DocumentFormUI } from "./ui/document-form";

export function DocumentForm() {
	const { t } = useTranslation();
	const { id } = useParams();
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useDocument({
		...(id ? { documentId: id } : {}),
	});

	const title = isEditMode
		? t("single.title-edit", { ns: "records" })
		: t("single.title-create", { ns: "records" });
	const description = isEditMode
		? t("single.description-edit", { ns: "records" })
		: t("single.description-create", { ns: "records" });
	const errorTitle = t("single.error.title", { ns: "records" });
	const errorDescription = t("single.error.description", { ns: "records" });

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
							{...(id ? { documentId: id } : {})}
							initialValues={{
								kind: document.kind,
								date: document.date,
								lineItems: document.lineItems.map(
									({ title, quantity, singleAmount }) => ({
										title,
										quantity,
										singleAmount,
									}),
								),
							}}
						/>
					)}
				</CardState>
			) : (
				<Card>
					<DocumentFormUI />
				</Card>
			)}
		</PageLayout>
	);
}
