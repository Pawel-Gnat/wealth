import type { BudgetMember } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import {
	Badge,
	ButtonDestructive,
	ButtonPrimary,
	Icon,
	Text,
	Tooltip,
} from "@/shared/components";
import { TextMuted } from "@/shared/components/typography/text";
import { AvatarGroup } from "@/shared/widgets/avatar-group";

type InvitationProps = {
	title: string;
	members: BudgetMember[];
	userId: string;
	inviteeId: string;
};

export const Invitation = ({
	title,
	members,
	userId,
	inviteeId,
}: InvitationProps) => {
	const { t } = useTranslation();

	const ownerEmail = members.find((member) => member.role === "owner")?.email;
	const inviteeEmail = members.find((member) => member.id === inviteeId)?.email;
	const isIncoming = inviteeId === userId;

	const subtitle = isIncoming
		? ownerEmail
			? t("invitations.invited-by", { ns: "group", email: ownerEmail })
			: null
		: inviteeEmail
			? t("invitations.waiting-for-acceptance", {
					ns: "group",
					email: inviteeEmail,
				})
			: null;

	return (
		<div className="flex items-center justify-between pb-4">
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Text weight="medium">{title}</Text>
					<Badge variant={isIncoming ? "secondary" : "default"}>
						{isIncoming
							? t("common.invited", { ns: "common" })
							: t("common.waiting", { ns: "common" })}
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					<AvatarGroup users={members} />
					<TextMuted size="xs">{subtitle}</TextMuted>
				</div>
			</div>
			<div className="flex flex-row gap-2">
				{isIncoming ? (
					<>
						<Tooltip
							trigger={
								<ButtonDestructive size="icon" onClick={() => {}}>
									<Icon name="reject" />
									<span className="sr-only">
										{t("action.reject", { ns: "common" })}
									</span>
								</ButtonDestructive>
							}
							text={t("action.reject", { ns: "common" })}
						/>
						<Tooltip
							trigger={
								<ButtonPrimary size="icon">
									<Icon name="accept" />
									<span className="sr-only">
										{t("action.accept", { ns: "common" })}
									</span>
								</ButtonPrimary>
							}
							text={t("action.accept", { ns: "common" })}
						/>
					</>
				) : (
					<Tooltip
						trigger={
							<ButtonDestructive size="icon" onClick={() => {}}>
								<Icon name="reject" />
								<span className="sr-only">
									{t("action.cancel", { ns: "common" })}
								</span>
							</ButtonDestructive>
						}
						text={t("action.cancel", { ns: "common" })}
					/>
				)}
			</div>
		</div>
	);
};
