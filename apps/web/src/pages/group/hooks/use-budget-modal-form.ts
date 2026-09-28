import type { User } from "@repo/api/types";
import { useState } from "react";
import { useCreateGroupBudgetForm } from "./use-create-group-budget-form";
import { useSearchUsers } from "./use-search-users";

export const useBudgetModalForm = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

	const clearSelection = () => {
		setQuery("");
		setSelectedMembers([]);
	};

	const { control, isPending, setValue, reset, createGroupBudget } =
		useCreateGroupBudgetForm({
			onCreated: () => {
				setIsOpen(false);
				clearSelection();
			},
		});

	const { users, hasMore, hasData, isLoading } = useSearchUsers(query);
	const selectedIds = new Set(selectedMembers.map((member) => member.id));
	const availableUsers = users.filter((user) => !selectedIds.has(user.id));

	const syncMemberIds = (members: User[]) => {
		setSelectedMembers(members);
		setValue(
			"memberIds",
			members.map((member) => member.id),
		);
	};

	const addMember = (user: User) => {
		if (selectedIds.has(user.id)) {
			return;
		}

		syncMemberIds([...selectedMembers, user]);
	};

	const removeMember = (userId: string) => {
		syncMemberIds(selectedMembers.filter((member) => member.id !== userId));
	};

	const close = () => {
		reset();
		clearSelection();
	};

	const onOpenChange = (open: boolean) => {
		setIsOpen(open);

		if (!open) {
			close();
		}
	};

	return {
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
	};
};
