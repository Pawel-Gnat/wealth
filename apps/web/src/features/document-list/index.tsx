import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ButtonSecondary, Card, Icon } from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import { PageLayout } from "@/shared/layouts";
import type { RecordKind } from "@/shared/types/record-kind";
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
					<ButtonSecondary className="w-fit ml-auto" asChild>
						<Link to={config.addRoute}>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</ButtonSecondary>
				}
			>
				<DocumentTable kind={kind} />
			</Card>
		</PageLayout>
	);
};
