import { useTranslation } from "react-i18next";
import { FormInput, FormModal, FormSearch } from "@/shared/components";
import { useBudgetModalForm } from "../hooks/use-budget-modal-form";
import { BudgetMemberResults } from "./budget-member-results";
import { BudgetSelectedMembers } from "./budget-selected-members";

export const BudgetModalForm = () => {
	const { t } = useTranslation();
	const {
		isOpen,
		onOpenChange,
		query,
		setQuery,
		selectedMembers,
		availableUsers,
		hasData,
		isLoading,
		hasMore,
		addMember,
		removeMember,
		control,
		isPending,
		createGroupBudget,
	} = useBudgetModalForm();

	return (
		<FormModal
			open={isOpen}
			onOpenChange={onOpenChange}
			triggerText={t("action.create", { ns: "common" })}
			triggerIcon="add"
			title={t("title", { ns: "group" })}
			isPending={isPending}
			onSubmit={createGroupBudget}
		>
			<FormInput
				name="title"
				label={t("title.label", { ns: "form" })}
				placeholder={t("title.placeholder", { ns: "form" })}
				control={control}
				icon="text"
			/>
			<div className="flex flex-col gap-4">
				<BudgetSelectedMembers
					members={selectedMembers}
					onRemove={removeMember}
				/>
				<FormSearch
					query={query}
					onQueryChange={setQuery}
					label={t("search.label", { ns: "form" })}
					placeholder={t("members.search.placeholder", { ns: "group" })}
					icon="search"
				/>
				<BudgetMemberResults
					users={availableUsers}
					hasData={hasData}
					isLoading={isLoading}
					hasMore={hasMore}
					onAdd={addMember}
				/>
			</div>
		</FormModal>
	);
};
