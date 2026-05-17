import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useDocument } from "@/features/document";
import { DocumentForm, DocumentFormSkeleton } from "@/features/document-form";
import { Card, ErrorState, Heading } from "@/shared/components";

export const IncomeFormPage = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useDocument({
		kind: "income",
		...(id ? { documentId: id } : {}),
	});

	if (isEditMode && isLoading) {
		return (
			<>
				<Heading>{t("single.title-edit", { ns: "incomes" })}</Heading>
				<Card content={<DocumentFormSkeleton />} />
			</>
		);
	}

	if (isEditMode && (isError || !data)) {
		return (
			<>
				<Heading>{t("single.title-edit", { ns: "incomes" })}</Heading>
				<Card
					content={<ErrorState text={t("list.error", { ns: "incomes" })} />}
				/>
			</>
		);
	}

	return (
		<>
			<Heading>
				{isEditMode
					? t("single.title-edit", { ns: "incomes" })
					: t("single.title-create", { ns: "incomes" })}
			</Heading>
			<Card
				content={
					<DocumentForm
						kind="income"
						{...(id ? { documentId: id } : {})}
						{...(data ? { initialValues: data } : {})}
					/>
				}
			/>
		</>
	);
};
