import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Button, Card, Icon } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";
import { DocumentTable } from "./ui/document-table";

export const DocumentList = () => {
	const { t } = useTranslation();

	return (
		<PageLayout
			title={t("list.title", { ns: "records" })}
			subtitle={t("list.subtitle", { ns: "records" })}
		>
			<Card
				actions={
					<Button variant="secondary" className="w-fit ml-auto" asChild>
						<Link to={APP_ROUTES.records.add}>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</Button>
				}
			>
				<DocumentTable />
			</Card>
		</PageLayout>
	);
};
