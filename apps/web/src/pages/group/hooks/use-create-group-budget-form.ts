import { zodResolver } from "@hookform/resolvers/zod";
import { budgetCreatePayloadSchema } from "@repo/api/schemas";
import type {
	BudgetCreatePayload,
	BudgetCreateResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

export const DEFAULT_CREATE_GROUP_BUDGET_VALUES: BudgetCreatePayload = {
	title: "",
	memberIds: [],
};

type UseCreateGroupBudgetFormProps = {
	onCreated: () => void;
};

export const useCreateGroupBudgetForm = ({
	onCreated,
}: UseCreateGroupBudgetFormProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const form = useForm<BudgetCreatePayload>({
		resolver: zodResolver(budgetCreatePayloadSchema),
		defaultValues: DEFAULT_CREATE_GROUP_BUDGET_VALUES,
	});

	const mutation = useMutation<
		BudgetCreateResponse,
		Error,
		BudgetCreatePayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(() =>
				controlledAsync(() => orpcClient.budget.create(payload)),
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.budgets.all(),
				exact: true,
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.budgets.invites(),
				exact: true,
			});
			form.reset(DEFAULT_CREATE_GROUP_BUDGET_VALUES);
			toast.success(t("toast.success.group-budget-created", { ns: "common" }));
			onCreated();
		},
		onError: () => {
			toast.error(t("toast.error.group-budget-created", { ns: "common" }));
		},
	});

	return {
		control: form.control,
		isPending: mutation.isPending,
		setValue: form.setValue,
		reset: () => form.reset(DEFAULT_CREATE_GROUP_BUDGET_VALUES),
		createGroupBudget: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
