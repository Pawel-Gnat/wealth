import type { GroupBudget } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ButtonSecondary, Heading, Icon } from "@/shared/components";
import { CardState } from "@/shared/widgets/card-state";
import { getActiveBudgets, getInvitations } from "./helpers/get-group-lists";
import { BudgetsList } from "./ui/budgets-list";
import { InvitationsList } from "./ui/invitations-list";

const CURRENT_USER_ID = "1";

const BUDGETS: GroupBudget[] = [
	{
		id: "budget-1",
		title: "Household",
		members: [
			{ id: "1", email: "me@example.com", role: "owner", status: "active" },
			{ id: "2", email: "anna@example.com", role: "member", status: "active" },
			{
				id: "3",
				email: "bartek@example.com",
				role: "member",
				status: "active",
			},
		],
	},
	{
		id: "budget-2",
		title: "Trip",
		members: [
			{ id: "1", email: "me@example.com", role: "owner", status: "active" },
			{ id: "4", email: "ola@example.com", role: "member", status: "active" },
			{ id: "5", email: "kuba@example.com", role: "member", status: "pending" },
		],
	},
	{
		id: "budget-3",
		title: "Shared rent",
		members: [
			{ id: "1", email: "me@example.com", role: "owner", status: "active" },
			{ id: "6", email: "ewa@example.com", role: "member", status: "pending" },
			{
				id: "7",
				email: "piotr@example.com",
				role: "member",
				status: "pending",
			},
		],
	},
	{
		id: "budget-4",
		title: "Office",
		members: [
			{ id: "2", email: "anna@example.com", role: "owner", status: "active" },
			{ id: "1", email: "me@example.com", role: "member", status: "active" },
			{
				id: "3",
				email: "bartek@example.com",
				role: "member",
				status: "active",
			},
		],
	},
	{
		id: "budget-5",
		title: "Weekend",
		members: [
			{ id: "3", email: "bartek@example.com", role: "owner", status: "active" },
			{ id: "1", email: "me@example.com", role: "member", status: "pending" },
			{ id: "4", email: "ola@example.com", role: "member", status: "active" },
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
				actions={
					<ButtonSecondary className="w-fit ml-auto" asChild>
						<Link to={"/"}>
							<Icon name="add" />
							{t("action.create", { ns: "common" })}
						</Link>
					</ButtonSecondary>
				}
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
