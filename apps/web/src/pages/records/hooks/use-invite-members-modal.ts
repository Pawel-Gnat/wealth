import { BUDGET_MEMBER_IDS_MAX } from "@repo/api/schemas";
import type { User } from "@repo/api/types";
import { useState } from "react";
import { useSearchUsers } from "@/pages/budgets/hooks/use-search-users";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useInviteMembersForm } from "./use-invite-members-form";

type UseInviteMembersModalProps = {
	budgetId: string;
	excludedUserIds: string[];
	memberCount: number;
};

export const useInviteMembersModal = ({
	budgetId,
	excludedUserIds,
	memberCount,
}: UseInviteMembersModalProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

	const clearSelection = () => {
		setSearch("");
		setSelectedMembers([]);
	};

	const { isPending, setValue, reset, inviteMembers } = useInviteMembersForm({
		budgetId,
		onInvited: () => {
			setIsOpen(false);
			clearSelection();
		},
	});

	const debouncedSearch = useDebounce(search);
	const { users, hasMore, hasData, isLoading, isError } =
		useSearchUsers(debouncedSearch);

	const excludedIds = new Set(excludedUserIds);
	const selectedIds = new Set(selectedMembers.map((member) => member.id));
	const availableUsers = users.filter(
		(user) => !selectedIds.has(user.id) && !excludedIds.has(user.id),
	);
	const remainingSlots = Math.max(BUDGET_MEMBER_IDS_MAX - memberCount, 0);

	const syncMemberIds = (members: User[]) => {
		setSelectedMembers(members);
		setValue(
			"memberIds",
			members.map((member) => member.id),
			{ shouldValidate: true },
		);
	};

	const addMember = (user: User) => {
		if (
			selectedIds.has(user.id) ||
			excludedIds.has(user.id) ||
			selectedMembers.length >= remainingSlots
		) {
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
		isPending,
		canSubmit: selectedMembers.length > 0,
		inviteMembers,
	};
};
