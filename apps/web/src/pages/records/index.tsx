import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Button, Card, Icon } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";
import { RecordTable } from "./ui/record-table";

export const RecordsListPage = () => {
	const { t } = useTranslation();
	const { budgetId } = useParams();

	const title = budgetId
		? t("records.title", { ns: "budgets" })
		: t("list.title", { ns: "records" });
	const subtitle = budgetId
		? t("records.subtitle", { ns: "budgets" })
		: t("list.subtitle", { ns: "records" });

	return (
		<PageLayout title={title} subtitle={subtitle}>
			<Card
				actions={
					<Button variant="secondary" className="w-fit ml-auto" asChild>
						<Link
							to={
								budgetId
									? APP_ROUTES.budgets.add(budgetId)
									: APP_ROUTES.records.add
							}
						>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</Button>
				}
			>
				<RecordTable {...(budgetId ? { budgetId } : {})} />
			</Card>
		</PageLayout>
	);
};
