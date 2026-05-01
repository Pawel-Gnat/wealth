import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table } from "@/shared/components";
import { type Expense, ExpenseColumns } from "./expense-columns";

const data: Expense[] = [
	{
		slug: "expense-1",
		amount: 100,
		date: new Date(),
	},
	{
		slug: "expense-2",
		amount: 200,
		date: new Date(),
	},
	{
		slug: "expense-3",
		amount: 300,
		date: new Date(),
	},
	{
		slug: "expense-4",
		amount: 400,
		date: new Date(),
	},
	{
		slug: "expense-5",
		amount: 500,
		date: new Date(),
	},
	{
		slug: "expense-6",
		amount: 600,
		date: new Date(),
	},
];

export const ExpenseTable = () => {
	const { t, i18n } = useTranslation();
	const columns = useMemo(
		() => ExpenseColumns({ t, language: i18n.language }),
		[i18n.language, t],
	);

	return <Table columns={columns} data={data} />;
};
