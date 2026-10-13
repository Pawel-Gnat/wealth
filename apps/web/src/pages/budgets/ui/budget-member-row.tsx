import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Button, Icon, Skeleton } from "@/shared/components";
import { UserAvatar } from "@/shared/widgets/user-avatar";

type BudgetMemberRowProps = {
	user: User;
	action: "add" | "remove";
	onAction: () => void;
};

export const BudgetMemberRow = ({
	user,
	action,
	onAction,
}: BudgetMemberRowProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-3 justify-between">
			<UserAvatar user={user} showUserName />

			<Button
				type="button"
				size="icon"
				variant={action === "remove" ? "secondary" : "default"}
				onClick={onAction}
			>
				<Icon name={action === "add" ? "add" : "reject"} />
				<span className="sr-only">
					{action === "add"
						? t("action.add", { ns: "common" })
						: t("action.delete", { ns: "common" })}
				</span>
			</Button>
		</div>
	);
};

export const BudgetMemberRowSkeleton = () => {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="flex items-center gap-2">
				<Skeleton className="size-8 rounded-full bg-background" />
				<div className="flex flex-col gap-1">
					<Skeleton className="h-4 w-28 bg-background" />
					<Skeleton className="h-3 w-40 bg-background" />
				</div>
			</div>
			<Skeleton className="size-9 rounded-full bg-background" />
		</div>
	);
};
