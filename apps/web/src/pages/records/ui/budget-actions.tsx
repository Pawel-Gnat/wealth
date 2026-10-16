import { hasPermission } from "@repo/common/permissions";
import { useUser } from "@/context/auth";
import { useBudgets } from "@/pages/budgets/hooks/use-budgets";
import { DeleteBudgetDialog } from "./delete-budget-dialog";
import { EditBudgetModal } from "./edit-budget-modal";
import { InviteMembersModal } from "./invite-members-modal";
import { LeaveBudgetDialog } from "./leave-budget-dialog";

type BudgetActionsProps = {
	budgetId: string;
};

export const BudgetActions = ({ budgetId }: BudgetActionsProps) => {
	const { data: user } = useUser();
	const { data: budgets } = useBudgets();
	const budget = budgets?.find((item) => item.id === budgetId);

	if (!user || !budget) {
		return null;
	}

	const membership =
		budget.members.find((member) => member.id === user.id)?.status ?? null;

	const canInvite = hasPermission(user.id, "budgets", "invite", {
		ownerId: budget.owner.id,
		membership,
	});
	const canEdit = hasPermission(user.id, "budgets", "edit", {
		ownerId: budget.owner.id,
		membership,
	});
	const canDelete = hasPermission(user.id, "budgets", "delete", {
		ownerId: budget.owner.id,
		membership,
	});
	const canLeave = hasPermission(user.id, "budgets", "leave", {
		ownerId: budget.owner.id,
		membership,
	});

	if (!canInvite && !canEdit && !canDelete && !canLeave) {
		return null;
	}

	return (
		<>
			{canInvite && (
				<InviteMembersModal
					budgetId={budgetId}
					excludedUserIds={[
						budget.owner.id,
						...budget.members.map((member) => member.id),
					]}
					memberCount={budget.members.length}
				/>
			)}
			{canEdit && <EditBudgetModal budgetId={budgetId} title={budget.title} />}
			{canDelete && <DeleteBudgetDialog budgetId={budgetId} />}
			{canLeave && <LeaveBudgetDialog budgetId={budgetId} />}
		</>
	);
};
