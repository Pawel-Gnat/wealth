import type { BudgetMember, User } from "@repo/api/types";
import { isOwner } from "@repo/common/permissions";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Badge, Text } from "@/shared/components";
import { AvatarGroup } from "@/shared/widgets/avatar-group";

type BudgetProps = {
	id: string;
	title: string;
	members: BudgetMember[];
	owner: User;
	userId: string;
};

export const Budget = ({ id, title, members, owner, userId }: BudgetProps) => {
	const { t } = useTranslation();
	const ownsBudget = isOwner(userId, {
		ownerId: owner.id,
		membership: members.find((member) => member.id === userId)?.status ?? null,
	});

	return (
		<Link
			to={APP_ROUTES.budgets.view(id)}
			className="flex items-center justify-between pb-4 hover:bg-muted transition-colors rounded-md p-4"
		>
			<div className="flex items-center gap-2">
				<Text weight="medium">{title}</Text>
				<Badge variant={ownsBudget ? "default" : "secondary"}>
					{ownsBudget
						? t("common.owner", { ns: "common" })
						: t("common.member", { ns: "common" })}
				</Badge>
			</div>
			<AvatarGroup users={[owner, ...members]} />
		</Link>
	);
};
