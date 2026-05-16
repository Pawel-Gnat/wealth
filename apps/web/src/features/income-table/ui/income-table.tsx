import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorState, Table } from "@/shared/components";
import { useDeleteIncome } from "../hooks/use-delete-income";
import { useIncomes } from "../hooks/use-incomes";
import { IncomeColumns } from "./income-columns";

export const IncomeTable = () => {
	const { t, i18n } = useTranslation();
	const { data, isLoading, isError } = useIncomes();
	const {
		deleteIncome,
		deletingIncomeId,
		isLoading: isDeleting,
	} = useDeleteIncome({
		onSuccess: () => {
			toast.success(t("toast.success.income_deleted", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.income_deleted", { ns: "common" }));
		},
	});

	const columns = useMemo(
		() =>
			IncomeColumns({
				t,
				language: i18n.language,
				onDeleteIncome: deleteIncome,
				deletingIncomeId,
				isDeleting,
			}),
		[deleteIncome, deletingIncomeId, i18n.language, isDeleting, t],
	);

	if (isError) return <ErrorState text={t("list.error", { ns: "incomes" })} />;

	return (
		<Table
			columns={columns}
			data={data}
			noResultsText={t("list.no-results", { ns: "incomes" })}
			isLoading={isLoading}
		/>
	);
};
