import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { getRecordConfig } from "../config/record-config";
import { useRecord } from "../form/hooks/use-record";
import { RecordActions } from "./ui/record-actions";
import { RecordDeleteDialog } from "./ui/record-delete-dialog";
import { RecordView } from "./ui/record-view";

export const RecordPage = () => {
	const { t } = useTranslation();
	const { id, budgetId } = useParams();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data, isLoading, isError } = useRecord({
		...(id ? { recordId: id } : {}),
	});
	const kind = data?.kind ?? "expense";
	const config = getRecordConfig(kind);

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
						editPath={
							budgetId
								? APP_ROUTES.budgets.edit(budgetId, id)
								: config.editRoute(id)
						}
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
