import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";

export const IncomeEditPage = () => {
	const { t } = useTranslation();

	return <Heading>{t("single.title-edit", { ns: "incomes" })}</Heading>;
};
