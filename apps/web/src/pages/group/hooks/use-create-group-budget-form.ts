import { zodResolver } from "@hookform/resolvers/zod";
import { groupBudgetCreatePayloadSchema } from "@repo/api/schemas";
import type {
	GroupBudgetCreatePayload,
	GroupBudgetCreateResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

export const DEFAULT_CREATE_GROUP_BUDGET_VALUES: GroupBudgetCreatePayload = {
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

	const form = useForm<GroupBudgetCreatePayload>({
		resolver: zodResolver(groupBudgetCreatePayloadSchema),
		defaultValues: DEFAULT_CREATE_GROUP_BUDGET_VALUES,
	});

	const mutation = useMutation<
		GroupBudgetCreateResponse,
		Error,
		GroupBudgetCreatePayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(() =>
				controlledAsync(() => orpcClient.group.create(payload)),
			),
		onSuccess: () => {
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
		reset: () => form.reset(DEFAULT_CREATE_GROUP_BUDGET_VALUES),
		createGroupBudget: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
