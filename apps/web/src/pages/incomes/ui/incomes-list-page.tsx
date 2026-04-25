import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";

export function IncomesListPage() {
	const { t } = useTranslation();

	return (
		<div>
			<Heading>{t("title", { ns: "incomes" })}</Heading>
		</div>
	);
}
