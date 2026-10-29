import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Avatar, Text, Tooltip } from "@/shared/components";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";

type AuditActorProps = {
	actorId: string | null;
	users: User[];
};

export const AuditActor = ({ actorId, users }: AuditActorProps) => {
	const { t } = useTranslation();
	const user = actorId
		? users.find((candidate) => candidate.id === actorId)
		: undefined;

	if (!user) {
		return <Text size="sm">{t("unknown-user", { ns: "audits" })}</Text>;
	}

	const label = hasUserName(user) ? getUserFullName(user) : user.email;

	return (
		<Tooltip
			trigger={
				<div className="inline-flex">
					<Avatar user={user} size="sm" />
				</div>
			}
			text={label}
		/>
	);
};
