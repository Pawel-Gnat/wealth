import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/router";
import { ExpenseTable } from "@/features/expense-table";
import { ButtonSecondary, Card, Heading, Icon } from "@/shared/components";

export function ExpensesListPage() {
	const { t } = useTranslation();

	return (
		<>
			<Heading>{t("list.title", { ns: "expenses" })}</Heading>
			<Card
				header={
					<ButtonSecondary className="w-fit ml-auto" asChild>
						<Link to={APP_ROUTES.expenses.add}>
							<Icon name="add" />
							{t("common.add", { ns: "common" })}
						</Link>
					</ButtonSecondary>
				}
				content={<ExpenseTable />}
			/>
		</>
	);
}
