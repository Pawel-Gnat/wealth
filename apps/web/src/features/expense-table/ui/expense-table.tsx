import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorState, Table } from "@/shared/components";
import { useDeleteExpense } from "../hooks/use-delete-expense";
import { useExpenses } from "../hooks/use-expenses";
import { ExpenseColumns } from "./expense-columns";

export const ExpenseTable = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useExpenses();
	const {
		deleteExpense,
		deletingExpenseId,
		isLoading: isDeleting,
	} = useDeleteExpense({
		onSuccess: () => {
			toast.success(t("toast.success.expense_deleted", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.expense_deleted", { ns: "common" }));
		},
	});

	const columns = useMemo(
		() =>
			ExpenseColumns({
				t,
				language: i18n.language,
				onDeleteExpense: deleteExpense,
				deletingExpenseId,
				isDeleting,
			}),
		[deleteExpense, deletingExpenseId, i18n.language, isDeleting, t],
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
