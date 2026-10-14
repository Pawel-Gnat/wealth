import { zodResolver } from "@hookform/resolvers/zod";
import { budgetInviteMembersPayloadSchema } from "@repo/api/schemas";
import type {
	BudgetInviteMembersPayload,
	BudgetInviteMembersResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { invalidateBudgetQueries } from "@/pages/budgets/hooks/invalidate-budget-queries";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

const DEFAULT_INVITE_MEMBERS_VALUES: BudgetInviteMembersPayload = {
	memberIds: [],
};

type UseInviteMembersFormProps = {
	budgetId: string;
	onInvited: () => void;
};

export const useInviteMembersForm = ({
	budgetId,
	onInvited,
}: UseInviteMembersFormProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const form = useForm<BudgetInviteMembersPayload>({
		resolver: zodResolver(budgetInviteMembersPayloadSchema),
		defaultValues: DEFAULT_INVITE_MEMBERS_VALUES,
	});

	const mutation = useMutation<
		BudgetInviteMembersResponse,
		Error,
		BudgetInviteMembersPayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(() =>
				controlledAsync(() =>
					orpcClient.budget.inviteMembers({
						id: budgetId,
						memberIds: payload.memberIds,
					}),
				),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			form.reset(DEFAULT_INVITE_MEMBERS_VALUES);
			toast.success(t("toast.success.members-invited", { ns: "common" }));
			onInvited();
		},
		onError: () => {
			toast.error(t("toast.error.members-invited", { ns: "common" }));
		},
	});

	return {
		isPending: mutation.isPending,
		setValue: form.setValue,
		reset: () => form.reset(DEFAULT_INVITE_MEMBERS_VALUES),
		inviteMembers: form.handleSubmit((payload) => mutation.mutate(payload)),
	};
};
