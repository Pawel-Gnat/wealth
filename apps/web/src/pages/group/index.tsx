import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ButtonSecondary, Card, Heading, Icon } from "@/shared/components";

export const GroupDocumentsPage = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "group" })}</Heading>
			<Card
				header={
					<ButtonSecondary className="w-fit ml-auto" asChild>
						<Link to={"/"}>
							<Icon name="add" />
							{t("action.add", { ns: "common" })}
						</Link>
					</ButtonSecondary>
				}
				content={<div>test</div>}
			/>
		</div>
	);
};
