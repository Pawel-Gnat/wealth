import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ErrorState, Table } from "@/shared/components";
import { useExpenses } from "../hooks/use-expenses";
import { ExpenseColumns } from "./expense-columns";

export const ExpenseTable = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useExpenses();

	const columns = useMemo(
		() => ExpenseColumns({ t, language: i18n.language }),
		[i18n.language, t],
	);

	if (isError) return <ErrorState text={t("list.error", { ns: "expenses" })} />;

	return (
		<Table
			columns={columns}
			data={data}
			noResultsText={t("list.no-results", { ns: "expenses" })}
			isLoading={isLoading}
		/>
	);
};
