import type {
	BudgetInviteAcceptedResponse,
	BudgetInviteCancelledResponse,
	BudgetInviteRejectedResponse,
} from "@repo/api/types";
import { runWithRequestId } from "@repo/observability/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { invalidateBudgetQueries } from "@/features/budgets/helpers/invalidate-budget-queries";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { useAppMutation } from "@/shared/hooks/use-app-mutation";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";

type UseBudgetInvitationProps = {
	budgetId: string;
	inviteeId: string;
};

export const useBudgetInvitation = ({
	budgetId,
	inviteeId,
}: UseBudgetInvitationProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const accept = useAppMutation<BudgetInviteAcceptedResponse, Error, void>({
		mutationFn: () =>
			runWithRequestId(() =>
				controlledAsync(() => orpcClient.budget.acceptInvite({ id: budgetId })),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			toast.success(t("toast.success.invite-accepted", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.invite-accepted", { ns: "common" }));
		},
	});

	const reject = useAppMutation<BudgetInviteRejectedResponse, Error, void>({
		mutationFn: () =>
			runWithRequestId(() =>
				controlledAsync(() => orpcClient.budget.rejectInvite({ id: budgetId })),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			toast.success(t("toast.success.invite-rejected", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.invite-rejected", { ns: "common" }));
		},
	});

	const cancel = useAppMutation<BudgetInviteCancelledResponse, Error, void>({
		mutationFn: () =>
			runWithRequestId(() =>
				controlledAsync(() =>
					orpcClient.budget.cancelInvite({ id: budgetId, userId: inviteeId }),
				),
			),
		onSuccess: () => {
			invalidateBudgetQueries(queryClient, budgetId);
			toast.success(t("toast.success.invite-cancelled", { ns: "common" }));
		},
		onError: () => {
			toast.error(t("toast.error.invite-cancelled", { ns: "common" }));
		},
	});

	const isPending = accept.isPending || reject.isPending || cancel.isPending;

	return {
		acceptInvite: () => accept.mutate(),
		rejectInvite: () => reject.mutate(),
		cancelInvite: () => cancel.mutate(),
		isPending,
	};
};
