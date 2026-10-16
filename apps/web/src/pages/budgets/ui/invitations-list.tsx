import type { BudgetInvite } from "@repo/api/types";
import { Invitation } from "./invitation";

type InvitationsListProps = {
	invitations: BudgetInvite[];
	userId: string;
};

export const InvitationsList = ({
	invitations,
	userId,
}: InvitationsListProps) => {
	return (
		<div className="space-y-4 *:not-last:border-b">
			{invitations.map(({ budget, invitee }) => (
				<Invitation
					key={`${budget.id}-${invitee.id}`}
					budget={budget}
					userId={userId}
					inviteeId={invitee.id}
				/>
			))}
		</div>
	);
};
