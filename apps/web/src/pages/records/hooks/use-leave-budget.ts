import type { BudgetLeaveResponse } from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { invalidateBudgetQueries } from "@/features/budgets/helpers/invalidate-budget-queries";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseLeaveBudgetProps = {
	budgetId: string;
	onLeft: () => void;
};

export const useLeaveBudget = ({ budgetId, onLeft }: UseLeaveBudgetProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const mutation = useMutation<BudgetLeaveResponse, Error, void>({
		mutationFn: () =>
			runWithRequestId(() =>
				controlledAsync(() => orpcClient.budget.leave({ id: budgetId })),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			toast.success(t("toast.success.budget-left", { ns: "common" }));
			onLeft();
		},
		onError: () => {
			toast.error(t("toast.error.budget-left", { ns: "common" }));
		},
	});

	return {
		leaveBudget: () => mutation.mutate(),
		isPending: mutation.isPending,
	};
};
