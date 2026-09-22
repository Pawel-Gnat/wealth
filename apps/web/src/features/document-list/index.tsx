import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { Button, Card, Icon } from "@/shared/components";
import { PageLayout } from "@/shared/layouts";
import { DocumentTable } from "./ui/document-table";

type DocumentListProps = {
	kind: RecordKind;
};

export const DocumentList = ({ kind }: DocumentListProps) => {
	const { t } = useTranslation();
	const config = getDocumentConfig(kind);

	return (
		<PageLayout
			title={t("list.title", { ns: config.i18nNamespace })}
			subtitle={t("list.subtitle", { ns: config.i18nNamespace })}
		>
			<Card
				actions={
					<Button variant="secondary" className="w-fit ml-auto" asChild>
						<Link to={config.addRoute}>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</Button>
				}
			>
				<DocumentTable kind={kind} />
			</Card>
		</PageLayout>
	);
};
