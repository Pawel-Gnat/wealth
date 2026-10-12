import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Card } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";
import { CardState } from "@/shared/widgets/card-state";
import { useRecord } from "./hooks/use-record";
import { RecordForm } from "./ui/record-form";

export const RecordFormPage = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const isEditMode = Boolean(id);
	const { data, isLoading, isError } = useRecord({
		...(id ? { recordId: id } : {}),
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
					{(record) => (
						<RecordForm
							{...(id ? { recordId: id } : {})}
							initialValues={{
								kind: record.kind,
								date: record.date,
								lineItems: record.lineItems.map(
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
					<RecordForm />
				</Card>
			)}
		</PageLayout>
	);
};
