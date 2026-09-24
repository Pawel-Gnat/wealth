import type { BudgetMember, GroupBudget } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Heading } from "@/shared/components";
import { CardState } from "@/shared/widgets/card-state";
import { getActiveBudgets, getInvitations } from "./helpers/get-group-lists";
import { BudgetModalForm } from "./ui/budget-modal-form";
import { BudgetsList } from "./ui/budgets-list";
import { InvitationsList } from "./ui/invitations-list";

const CURRENT_USER_ID = "1";

const member = (
	id: string,
	email: string,
	role: BudgetMember["role"],
	status: BudgetMember["status"],
): BudgetMember => ({
	id,
	email,
	firstName: null,
	lastName: null,
	role,
	status,
});

const BUDGETS: GroupBudget[] = [
	{
		id: "budget-1",
		title: "Household",
		ownerId: "1",
		expenses: [],
		incomes: [],
		members: [
			member("1", "me@example.com", "owner", "active"),
			member("2", "anna@example.com", "member", "active"),
			member("3", "bartek@example.com", "member", "active"),
		],
	},
	{
		id: "budget-2",
		title: "Trip",
		ownerId: "1",
		expenses: [],
		incomes: [],
		members: [
			member("1", "me@example.com", "owner", "active"),
			member("4", "ola@example.com", "member", "active"),
			member("5", "kuba@example.com", "member", "pending"),
		],
	},
	{
		id: "budget-3",
		title: "Shared rent",
		ownerId: "1",
		expenses: [],
		incomes: [],
		members: [
			member("1", "me@example.com", "owner", "active"),
			member("6", "ewa@example.com", "member", "pending"),
			member("7", "piotr@example.com", "member", "pending"),
		],
	},
	{
		id: "budget-4",
		title: "Office",
		ownerId: "2",
		expenses: [],
		incomes: [],
		members: [
			member("2", "anna@example.com", "owner", "active"),
			member("1", "me@example.com", "member", "active"),
			member("3", "bartek@example.com", "member", "active"),
		],
	},
	{
		id: "budget-5",
		title: "Weekend",
		ownerId: "3",
		expenses: [],
		incomes: [],
		members: [
			member("3", "bartek@example.com", "owner", "active"),
			member("1", "me@example.com", "member", "pending"),
			member("4", "ola@example.com", "member", "active"),
		],
	},
];

export const GroupDocumentsPage = () => {
	const { t } = useTranslation();

	const budgets = getActiveBudgets(BUDGETS, CURRENT_USER_ID);
	const invitations = getInvitations(BUDGETS, CURRENT_USER_ID);

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "group" })}</Heading>

			<CardState
				title={t("budgets.title", { ns: "group" })}
				actions={<BudgetModalForm />}
				data={budgets}
				isError={false}
				errorTitle={t("budgets.error.title", { ns: "group" })}
				errorDescription={t("budgets.error.description", { ns: "group" })}
				emptyTitle={t("budgets.empty.title", { ns: "group" })}
				emptyDescription={t("budgets.empty.description", { ns: "group" })}
				emptyIcon="group"
			>
				{(items) => <BudgetsList budgets={items} userId={CURRENT_USER_ID} />}
			</CardState>

			<CardState
				title={t("invitations.title", { ns: "group" })}
				data={invitations}
				isError={false}
				errorTitle={t("invitations.error.title", { ns: "group" })}
				errorDescription={t("invitations.error.description", {
					ns: "group",
				})}
				emptyTitle={t("invitations.empty.title", { ns: "group" })}
				emptyDescription={t("invitations.empty.description", {
					ns: "group",
				})}
				emptyIcon="email"
			>
				{(items) => (
					<InvitationsList invitations={items} userId={CURRENT_USER_ID} />
				)}
			</CardState>
		</div>
	);
};
