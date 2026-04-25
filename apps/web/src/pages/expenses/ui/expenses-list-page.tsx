import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";

export function ExpensesListPage() {
	const { t } = useTranslation();

	return (
		<div>
			<Heading>{t("title", { ns: "expenses" })}</Heading>
		</div>
	);
}
