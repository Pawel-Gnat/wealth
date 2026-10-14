import { zodResolver } from "@hookform/resolvers/zod";
import { budgetUpdatePayloadSchema } from "@repo/api/schemas";
import type {
	BudgetUpdatePayload,
	BudgetUpdateResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { invalidateBudgetQueries } from "@/pages/budgets/hooks/invalidate-budget-queries";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseEditBudgetFormProps = {
	budgetId: string;
	title: string;
	onUpdated: () => void;
};

export const useEditBudgetForm = ({
	budgetId,
	title,
	onUpdated,
}: UseEditBudgetFormProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const form = useForm<BudgetUpdatePayload>({
		resolver: zodResolver(budgetUpdatePayloadSchema),
		defaultValues: { title },
	});

	const mutation = useMutation<
		BudgetUpdateResponse,
		Error,
		BudgetUpdatePayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(() =>
				controlledAsync(() =>
					orpcClient.budget.update({
						id: budgetId,
						title: payload.title,
					}),
				),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			toast.success(t("toast.success.budget-updated", { ns: "common" }));
			onUpdated();
		},
		onError: () => {
			toast.error(t("toast.error.budget-updated", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		reset: () => form.reset({ title }),
		updateBudget: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
