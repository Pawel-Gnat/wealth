import type { GroupInvitation } from "../helpers/get-group-lists";
import { Invitation } from "./invitation";

type InvitationsListProps = {
	invitations: GroupInvitation[];
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
					title={budget.title}
					userId={userId}
					inviteeId={invitee.id}
					members={budget.members}
				/>
			))}
		</div>
	);
};
