import { useTranslation } from "react-i18next";
import { BudgetMemberResults } from "@/pages/budgets/ui/budget-member-results";
import { BudgetSelectedMembers } from "@/pages/budgets/ui/budget-selected-members";
import { ErrorState, FormModal, FormSearch } from "@/shared/components";
import { useInviteMembersModal } from "../hooks/use-invite-members-modal";

type InviteMembersModalProps = {
	budgetId: string;
	excludedUserIds: string[];
	memberCount: number;
};

export const InviteMembersModal = ({
	budgetId,
	excludedUserIds,
	memberCount,
}: InviteMembersModalProps) => {
	const { t } = useTranslation();
	const {
		isOpen,
		onOpenChange,
		search,
		setSearch,
		selectedMembers,
		availableUsers,
		hasData,
		isLoading,
		isError,
		hasMore,
		addMember,
		removeMember,
		isPending,
		canSubmit,
		inviteMembers,
	} = useInviteMembersModal({ budgetId, excludedUserIds, memberCount });

	return (
		<FormModal
			open={isOpen}
			onOpenChange={onOpenChange}
			triggerText={t("action.invite", { ns: "common" })}
			triggerIcon="addUser"
			title={t("invite.title", { ns: "budgets" })}
			isPending={isPending}
			disabled={!canSubmit}
			submitText={t("action.add", { ns: "common" })}
			onSubmit={inviteMembers}
		>
			<div className="flex flex-col gap-3">
				<BudgetSelectedMembers
					members={selectedMembers}
					onRemove={removeMember}
				/>
				<FormSearch
					search={search}
					onSearchChange={setSearch}
					label={t("search.label", { ns: "form" })}
					placeholder={t("members.search.placeholder", { ns: "budgets" })}
					icon="search"
				/>
				{isError ? (
					<ErrorState
						title={t("members.search.error.title", { ns: "budgets" })}
						description={t("members.search.error.description", {
							ns: "budgets",
						})}
					/>
				) : (
					<BudgetMemberResults
						users={availableUsers}
						hasData={hasData}
						isLoading={isLoading}
						hasMore={hasMore}
						onAdd={addMember}
					/>
				)}
			</div>
		</FormModal>
	);
};
