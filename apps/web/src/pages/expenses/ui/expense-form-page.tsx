import { useTranslation } from "react-i18next";
import { ExpenseForm } from "@/features/expense-form";
import { Card, Heading } from "@/shared/components";

export const ExpenseFormPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Heading>{t("list.title", { ns: "expenses" })}</Heading>
			<Card content={<ExpenseForm />} />
		</>
	);
};
