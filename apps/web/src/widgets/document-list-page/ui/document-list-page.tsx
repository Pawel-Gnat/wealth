import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { getDocumentConfig, type RecordKind } from "@/features/document";
import { DocumentTable } from "@/features/document-table";
import { ButtonSecondary, Card, Heading, Icon } from "@/shared/components";

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
