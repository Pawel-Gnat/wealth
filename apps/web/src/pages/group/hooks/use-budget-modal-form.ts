import type { User } from "@repo/api/types";
import { useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useCreateGroupBudgetForm } from "./use-create-group-budget-form";
import { useSearchUsers } from "./use-search-users";

export const useBudgetModalForm = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

	const clearSelection = () => {
		setSearch("");
		setSelectedMembers([]);
	};

	const { control, isPending, setValue, reset, createGroupBudget } =
		useCreateGroupBudgetForm({
			onCreated: () => {
				setIsOpen(false);
				clearSelection();
			},
		});

	const debouncedSearch = useDebounce(search);
	const { users, hasMore, hasData, isLoading, isError } =
		useSearchUsers(debouncedSearch);
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
		control,
		isPending,
		createGroupBudget,
	};
};
