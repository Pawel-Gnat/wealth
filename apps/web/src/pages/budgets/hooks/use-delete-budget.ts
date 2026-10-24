import type { BudgetDeleteResponse } from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { invalidateBudgetQueries } from "@/features/budgets/helpers/invalidate-budget-queries";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseDeleteBudgetProps = {
	budgetId: string;
	onDeleted: () => void;
};

export const useDeleteBudget = ({
	budgetId,
	onDeleted,
}: UseDeleteBudgetProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const mutation = useAppMutation<BudgetDeleteResponse, Error, void>({
		mutationFn: () =>
			runWithRequestId(() =>
				controlledAsync(() => orpcClient.budget.delete({ id: budgetId })),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			toast.success(t("toast.success.budget-deleted", { ns: "common" }));
			onDeleted();
		},
		onError: () => {
			toast.error(t("toast.error.budget-deleted", { ns: "common" }));
		},
	});

	return {
		deleteBudget: () => mutation.mutate(),
		isPending: mutation.isPending,
	};
};
