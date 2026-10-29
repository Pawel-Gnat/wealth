import { BUDGET_AUDIT_EVENTS, RECORD_AUDIT_EVENTS } from "@repo/api/events";
import type { AuditsParams, User } from "@repo/api/types";
import { useUser } from "@/context/auth";
import { useBudgets } from "@/pages/budgets/hooks/use-budgets";
import { AuditLog } from "@/shared/widgets/audit-log";

const recordActions = [...RECORD_AUDIT_EVENTS];
const budgetActions = [...BUDGET_AUDIT_EVENTS];

type RecordsAuditLogProps = {
	budgetId?: string;
	recordId?: string;
};

const PersonalRecordsAuditLog = ({ recordId }: { recordId?: string }) => {
	const { data: user } = useUser();

	const params: AuditsParams = recordId
		? { actions: recordActions, entityId: recordId }
		: { actions: recordActions };

	return <AuditLog params={params} users={user ? [user] : []} />;
};

const BudgetRecordsAuditLog = ({
	budgetId,
	recordId,
}: {
	budgetId: string;
	recordId?: string;
}) => {
	const { data: budgets } = useBudgets();
	const budget = budgets?.find((item) => item.id === budgetId);
	const users: User[] = budget ? [budget.owner, ...budget.members] : [];

	const params: AuditsParams = recordId
		? { actions: recordActions, entityId: recordId, budgetId }
		: { actions: budgetActions, entityId: budgetId };

	return <AuditLog params={params} users={users} />;
};

export const RecordsAuditLog = ({
	budgetId,
	recordId,
}: RecordsAuditLogProps) => {
	if (budgetId) {
		return (
			<BudgetRecordsAuditLog
				budgetId={budgetId}
				{...(recordId ? { recordId } : {})}
			/>
		);
	}

	return <PersonalRecordsAuditLog {...(recordId ? { recordId } : {})} />;
};
