import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import { invalidateBudgetQueries } from "./invalidate-budget-queries";

describe("invalidateBudgetQueries", () => {
	it("refreshes the budget, its records, and the audit log", () => {
		const queryClient = new QueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const budgetId = "budget-1";

		invalidateBudgetQueries(queryClient, budgetId);

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: queryKeys.budgets.all(),
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: queryKeys.records.list(budgetId),
		});
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: queryKeys.audits.all(),
		});
	});
});
