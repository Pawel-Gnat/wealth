import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";
import { BudgetMemberRow, BudgetMemberRowSkeleton } from "./budget-member-row";
import { BudgetMembers } from "./budget-members";

type BudgetMemberResultsProps = {
	users: User[];
	hasData: boolean;
	isLoading: boolean;
	hasMore: boolean;
	onAdd: (user: User) => void;
};

const SKELETON_ROW_KEYS = ["member-row-1", "member-row-2", "member-row-3"];

export const BudgetMemberResults = ({
	users,
	hasData,
	isLoading,
	hasMore,
	onAdd,
}: BudgetMemberResultsProps) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<BudgetMembers className="mt-2">
				{SKELETON_ROW_KEYS.map((key) => (
					<BudgetMemberRowSkeleton key={key} />
				))}
			</BudgetMembers>
		);
	}

	if (!hasData) {
		return null;
	}

	return (
		<BudgetMembers className="mt-2">
			{users.length === 0 ? (
				<Text size="sm" color="muted" className="text-center">
					{t("search.empty", { ns: "form" })}
				</Text>
			) : (
				<div className="flex flex-col gap-4">
					{users.map((user) => (
						<BudgetMemberRow
							key={user.id}
							user={user}
							action="add"
							onAction={() => onAdd(user)}
						/>
					))}
				</div>
			)}

			{hasMore && (
				<Text size="sm" color="muted" className="text-center">
					{t("members.search.refine", { ns: "group" })}
				</Text>
			)}
		</BudgetMembers>
	);
};
