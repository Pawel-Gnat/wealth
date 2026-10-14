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

	const isOwner = budget.owner.id === user.id;

	if (isOwner) {
		return (
			<>
				<InviteMembersModal
					budgetId={budgetId}
					excludedUserIds={[
						budget.owner.id,
						...budget.members.map((member) => member.id),
					]}
					memberCount={budget.members.length}
				/>
				<EditBudgetModal budgetId={budgetId} title={budget.title} />
				<DeleteBudgetDialog budgetId={budgetId} />
			</>
		);
	}

	const isActiveMember = budget.members.some(
		(member) => member.id === user.id && member.status === "active",
	);

	if (!isActiveMember) {
		return null;
	}

	return <LeaveBudgetDialog budgetId={budgetId} />;
};
