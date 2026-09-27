import type { BudgetMember } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Badge, Button, Icon, Text, Tooltip } from "@/shared/components";
import { AvatarGroup } from "@/shared/widgets/avatar-group";

type BudgetProps = {
	id: string;
	title: string;
	members: BudgetMember[];
	ownerId: string;
	userId: string;
};

export const Budget = ({
	id,
	title,
	members,
	ownerId,
	userId,
}: BudgetProps) => {
	const { t } = useTranslation();
	const isOwner = ownerId === userId;

	return (
		<Link
			to={APP_ROUTES.group.view(id)}
			className="flex items-center justify-between pb-4 hover:bg-muted transition-colors rounded-md p-4"
		>
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Text weight="medium">{title}</Text>
					<Badge variant={isOwner ? "default" : "secondary"}>
						{isOwner
							? t("common.owner", { ns: "common" })
							: t("common.member", { ns: "common" })}
					</Badge>
				</div>
				<AvatarGroup users={members} />
			</div>
			<div className="flex flex-row gap-2">
				{isOwner ? (
					<>
						<Tooltip
							trigger={
								<Button variant="secondary" size="icon">
									<Icon name="addUser" />
									<span className="sr-only">
										{t("action.add", { ns: "common" })}
									</span>
								</Button>
							}
							text={t("action.add", { ns: "common" })}
						/>
						<Tooltip
							trigger={
								<Button variant="secondary" size="icon">
									<Icon name="edit" />
									<span className="sr-only">
										{t("action.edit", { ns: "common" })}
									</span>
								</Button>
							}
							text={t("action.edit", { ns: "common" })}
						/>
						<Tooltip
							trigger={
								<Button variant="destructive" size="icon" onClick={() => {}}>
									<Icon name="delete" />
									<span className="sr-only">
										{t("action.delete", { ns: "common" })}
									</span>
								</Button>
							}
							text={t("action.delete", { ns: "common" })}
						/>
					</>
				) : (
					<Tooltip
						trigger={
							<Button variant="destructive" size="icon" onClick={() => {}}>
								<Icon name="leave" />
								<span className="sr-only">
									{t("action.leave", { ns: "common" })}
								</span>
							</Button>
						}
						text={t("action.leave", { ns: "common" })}
					/>
				)}
			</div>
		</Link>
	);
};
