import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { useBudgetDocuments } from "./hooks/use-budget-documents";
import { BudgetDocuments } from "./ui/budget-documents";

export const BudgetPage = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const { data, isLoading, isError } = useBudgetDocuments({ id });

	if (!id) {
		return null;
	}

	return (
		<PageLayout
			title={t("documents.title", { ns: "group" })}
			subtitle={t("documents.subtitle", { ns: "group" })}
		>
			<CardState
				data={data}
				isError={isError}
				isLoading={isLoading}
				errorTitle={t("documents.error.title", { ns: "group" })}
				errorDescription={t("documents.error.description", { ns: "group" })}
				emptyTitle={t("documents.empty.title", { ns: "group" })}
				emptyDescription={t("documents.empty.description", { ns: "group" })}
				emptyIcon="group"
				skeletonClassName="h-100"
			>
				{(documents) => <BudgetDocuments documents={documents} />}
			</CardState>
		</PageLayout>
	);
};
