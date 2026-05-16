import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";

export const IncomeAddPage = () => {
	const { t } = useTranslation();

	return <Heading>{t("single.title-create", { ns: "incomes" })}</Heading>;
};
