import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";
import { BudgetMemberRow, BudgetMemberRowSkeleton } from "./budget-member-row";
import { BudgetMembersList } from "./budget-members-list";

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

	if (isLoading && !hasData) {
		return (
			<BudgetMembersList className="mt-2">
				{SKELETON_ROW_KEYS.map((key) => (
					<li key={key}>
						<BudgetMemberRowSkeleton />
					</li>
				))}
			</BudgetMembersList>
		);
	}

	if (!hasData) {
		return null;
	}

	return (
		<BudgetMembersList className="mt-2">
			{users.length === 0 ? (
				<Text size="sm" color="muted" className="text-center">
					{t("search.empty", { ns: "form" })}
				</Text>
			) : (
				<ul className="flex flex-col gap-4">
					{users.map((user) => (
						<li key={user.id}>
							<BudgetMemberRow
								user={user}
								action="add"
								onAction={() => onAdd(user)}
							/>
						</li>
					))}
				</ul>
			)}

			{hasMore && (
				<Text size="sm" color="muted" className="text-center">
					{t("members.search.refine", { ns: "group" })}
				</Text>
			)}
		</BudgetMembersList>
	);
};
