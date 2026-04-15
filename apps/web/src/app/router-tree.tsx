import { Route, Routes } from "react-router";
import { AuthPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import {
	ExpenseAddPage,
	ExpenseEditPage,
	ExpensesListPage,
} from "@/pages/expenses";
import {
	IncomeAddPage,
	IncomeEditPage,
	IncomesListPage,
} from "@/pages/incomes";
import { DashboardLayout } from "@/widgets/dashboard-layout";

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/auth" element={<AuthPage />} />
			<Route element={<DashboardLayout />}>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/incomes" element={<IncomesListPage />} />
				<Route path="/incomes/add" element={<IncomeAddPage />} />
				<Route path="/incomes/:id" element={<IncomeEditPage />} />
				<Route path="/expenses" element={<ExpensesListPage />} />
				<Route path="/expenses/add" element={<ExpenseAddPage />} />
				<Route path="/expenses/:id" element={<ExpenseEditPage />} />
			</Route>
		</Routes>
	);
}
