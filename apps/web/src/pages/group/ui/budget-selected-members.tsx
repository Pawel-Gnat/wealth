import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Text } from "@/shared/components";
import { BudgetMemberRow } from "./budget-member-row";
import { BudgetMembers } from "./budget-members";

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
				<BudgetMembers>
					{members.map((member) => (
						<BudgetMemberRow
							key={member.id}
							user={member}
							action="remove"
							onAction={() => onRemove(member.id)}
						/>
					))}
				</BudgetMembers>
			)}
		</>
	);
};
