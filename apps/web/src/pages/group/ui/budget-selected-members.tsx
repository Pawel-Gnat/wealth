import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";
import { BudgetMemberRow } from "./budget-member-row";
import { BudgetMembersList } from "./budget-members-list";

type BudgetSelectedMembersProps = {
	members: User[];
	onRemove: (userId: string) => void;
};

export const BudgetSelectedMembers = ({
	members,
	onRemove,
}: BudgetSelectedMembersProps) => {
	const { t } = useTranslation();

	return (
		<>
			<Text size="sm" weight="medium">
				{t("members.label", { ns: "group" })}
			</Text>

			{members.length === 0 ? (
				<Text size="sm" color="muted">
					{t("members.empty", { ns: "group" })}
				</Text>
			) : (
				<BudgetMembersList>
					{members.map((member) => (
						<li key={member.id}>
							<BudgetMemberRow
								user={member}
								action="remove"
								onAction={() => onRemove(member.id)}
							/>
						</li>
					))}
				</BudgetMembersList>
			)}
		</>
	);
};
