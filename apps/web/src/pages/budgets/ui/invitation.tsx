import type { BudgetListItem } from "@repo/api/types";
import { hasPermission } from "@repo/common/permissions";
import { useTranslation } from "react-i18next";
import { Badge, Button, Icon, Text, Tooltip } from "@/shared/components";
import { AvatarGroup } from "@/shared/widgets/avatar-group";
import { useBudgetInvitation } from "../hooks/use-budget-invitation";

type InvitationProps = {
	budget: BudgetListItem;
	userId: string;
	inviteeId: string;
};

export const Invitation = ({ budget, userId, inviteeId }: InvitationProps) => {
	const { t } = useTranslation();
	const { acceptInvite, rejectInvite, cancelInvite, isPending } =
		useBudgetInvitation({
			budgetId: budget.id,
			inviteeId,
		});

	const inviteeEmail = budget.members.find(
		(member) => member.id === inviteeId,
	)?.email;
	const membership =
		budget.members.find((member) => member.id === userId)?.status ?? null;

	const canRespond = hasPermission(userId, "budgets", "acceptInvite", {
		ownerId: budget.owner.id,
		membership,
	});
	const canCancel = hasPermission(userId, "budgets", "cancelInvite", {
		ownerId: budget.owner.id,
		membership,
	});

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
					<Text weight="medium">{budget.title}</Text>
					<Badge variant={canRespond ? "secondary" : "default"}>
						{canRespond
							? t("common.invited", { ns: "common" })
							: t("common.waiting", { ns: "common" })}
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					<AvatarGroup users={budget.members} />
					{!canRespond && subtitle && (
						<Text size="xs" color="muted">
							{subtitle}
						</Text>
					)}
				</div>
			</div>
			<div className="flex flex-row gap-2">
				{canRespond && (
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
				)}
				{canCancel && (
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
