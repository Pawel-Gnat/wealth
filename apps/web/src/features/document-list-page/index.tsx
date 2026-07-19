import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ButtonSecondary, Card, Heading, Icon } from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import type { RecordKind } from "@/shared/types/record-kind";
import { DocumentTable } from "./ui/document-table";

type DocumentListPageProps = {
	kind: RecordKind;
};

export function DocumentListPage({ kind }: DocumentListPageProps) {
	const { t } = useTranslation();
	const config = getDocumentConfig(kind);

	return (
		<>
			<Heading>{t("list.title", { ns: config.i18nNamespace })}</Heading>
			<Card
				header={
					<ButtonSecondary className="w-fit ml-auto" asChild>
						<Link to={config.addRoute}>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</ButtonSecondary>
				}
				content={<DocumentTable kind={kind} />}
			/>
		</>
	);
}
