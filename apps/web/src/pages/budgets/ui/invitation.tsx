import type { BudgetMember } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Badge, Button, Icon, Text, Tooltip } from "@/shared/components";
import { AvatarGroup } from "@/shared/widgets/avatar-group";
import { useBudgetInvitation } from "../hooks/use-budget-invitation";

type InvitationProps = {
	budgetId: string;
	title: string;
	members: BudgetMember[];
	userId: string;
	inviteeId: string;
};

export const Invitation = ({
	budgetId,
	title,
	members,
	userId,
	inviteeId,
}: InvitationProps) => {
	const { t } = useTranslation();
	const { acceptInvite, rejectInvite, cancelInvite, isPending } =
		useBudgetInvitation({ budgetId, inviteeId });

	const inviteeEmail = members.find((member) => member.id === inviteeId)?.email;
	const isInvitee = inviteeId === userId;

	const subtitle = inviteeEmail
		? t("invitations.waiting-for-acceptance", {
				ns: "budgets",
				email: inviteeEmail,
			})
		: null;

	return (
		<div className="flex items-center justify-between pb-4">
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Text weight="medium">{title}</Text>
					<Badge variant={isInvitee ? "secondary" : "default"}>
						{isInvitee
							? t("common.invited", { ns: "common" })
							: t("common.waiting", { ns: "common" })}
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					<AvatarGroup users={members} />
					{!isInvitee && subtitle && (
						<Text size="xs" color="muted">
							{subtitle}
						</Text>
					)}
				</div>
			</div>
			<div className="flex flex-row gap-2">
				{isInvitee ? (
					<>
						<Tooltip
							trigger={
								<Button
									variant="destructive"
									size="icon"
									disabled={isPending}
									onClick={rejectInvite}
								>
									<Icon name="reject" />
									<span className="sr-only">
										{t("action.reject", { ns: "common" })}
									</span>
								</Button>
							}
							text={t("action.reject", { ns: "common" })}
						/>
						<Tooltip
							trigger={
								<Button size="icon" disabled={isPending} onClick={acceptInvite}>
									<Icon name="accept" />
									<span className="sr-only">
										{t("action.accept", { ns: "common" })}
									</span>
								</Button>
							}
							text={t("action.accept", { ns: "common" })}
						/>
					</>
				) : (
					<Tooltip
						trigger={
							<Button
								variant="destructive"
								size="icon"
								disabled={isPending}
								onClick={cancelInvite}
							>
								<Icon name="reject" />
								<span className="sr-only">
									{t("action.cancel", { ns: "common" })}
								</span>
							</Button>
						}
						text={t("action.cancel", { ns: "common" })}
					/>
				)}
			</div>
		</div>
	);
};
