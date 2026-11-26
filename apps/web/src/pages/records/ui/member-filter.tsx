import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBudgets } from "@/pages/budgets/hooks/use-budgets";
import { Button, Icon } from "@/shared/components";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
} from "@/shared/lib/ui/combobox";
import { Field, FieldLabel } from "@/shared/lib/ui/field";
import {
	memberIds,
	memberLabel,
	membersForBudget,
	sameMember,
	selectedMembers,
} from "../helpers/record-members";

type MemberFilterProps = {
	budgetId: string;
	value: string[];
	onValueChange: (userIds: string[]) => void;
	className?: string;
};

export const MemberFilter = ({
	budgetId,
	value,
	onValueChange,
	className,
}: MemberFilterProps) => {
	const { t } = useTranslation();
	const { data: budgets } = useBudgets();
	const labelId = useId();
	const [open, setOpen] = useState(false);
	const users = membersForBudget(budgets, budgetId);
	const selectedUsers = selectedMembers(users, value);
	const label = t("list.filters.member.label", { ns: "records" });
	const summary =
		value.length === 0
			? t("list.filters.member.all", { ns: "records" })
			: t(
					value.length === 1
						? "list.filters.member.selected-one"
						: "list.filters.member.selected-other",
					{ ns: "records", count: value.length },
				);

	return (
		<Field className={className}>
			<FieldLabel id={labelId}>{label}</FieldLabel>
			<Combobox
				items={users}
				multiple
				open={open}
				onOpenChange={setOpen}
				value={selectedUsers}
				onValueChange={(next) => {
					onValueChange(memberIds(next));
					setOpen(true);
				}}
				isItemEqualToValue={sameMember}
				itemToStringLabel={memberLabel}
			>
				<ComboboxTrigger
					aria-labelledby={labelId}
					render={
						<Button variant="input" className="w-full justify-between">
							{null}
						</Button>
					}
					onMouseDown={(event) => {
						event.preventDefault();
						setOpen((current) => !current);
					}}
				>
					<span className="flex min-w-0 items-center gap-2">
						<Icon name="group" />
						<span className="truncate">{summary}</span>
					</span>
				</ComboboxTrigger>
				<ComboboxContent>
					<ComboboxEmpty>{t("search.empty", { ns: "form" })}</ComboboxEmpty>
					<ComboboxList>
						{(user) => (
							<ComboboxItem key={user.id} value={user}>
								{memberLabel(user)}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</Field>
	);
};
