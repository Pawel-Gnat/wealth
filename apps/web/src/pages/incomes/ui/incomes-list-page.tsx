import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/router";
import { DocumentTable } from "@/features/document-table";
import { ButtonSecondary, Card, Heading, Icon } from "@/shared/components";

export const IncomesListPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Heading>{t("list.title", { ns: "incomes" })}</Heading>
			<Card
				header={
					<ButtonSecondary className="w-fit ml-auto" asChild>
						<Link to={APP_ROUTES.incomes.add}>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</ButtonSecondary>
				}
				content={<DocumentTable kind="income" />}
			/>
		</>
	);
};
