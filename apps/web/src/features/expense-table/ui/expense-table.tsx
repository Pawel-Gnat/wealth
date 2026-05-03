import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useExpenses } from "@/features/expense-table/hooks/use-expenses";
import { Table, Text } from "@/shared/components";
import { ExpenseColumns } from "./expense-columns";

export const ExpenseTable = () => {
	const { t, i18n } = useTranslation();
	const { data = [], isPending, isError, error } = useExpenses();

	const columns = useMemo(
		() => ExpenseColumns({ t, language: i18n.language }),
		[i18n.language, t],
	);

	if (isPending) {
		return (
			<Text size="sm" className="text-muted-foreground">
				{t("common.loading", { ns: "common" })}
			</Text>
		);
	}

	if (isError) {
		return (
			<Text size="sm" className="text-destructive">
				{error?.message ?? t("error.load_failed", { ns: "expenses" })}
			</Text>
		);
	}

	return <Table columns={columns} data={data} />;
};
