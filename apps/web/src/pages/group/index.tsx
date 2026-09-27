import { useTranslation } from "react-i18next";
import { useUser } from "@/context/auth";
import { Heading } from "@/shared/components";
import { CardState } from "@/shared/widgets/card-state";
import { getInvitations } from "./helpers/get-group-lists";
import { useBudgets } from "./hooks/use-budgets";
import { BudgetModalForm } from "./ui/budget-modal-form";
import { BudgetsList } from "./ui/budgets-list";
import { InvitationsList } from "./ui/invitations-list";

export const GroupDocumentsPage = () => {
	const { t } = useTranslation();
	const { data: user } = useUser();
	const { data: budgets, isLoading, isError } = useBudgets();

	if (!user) {
		return null;
	}

	const invitations = budgets ? getInvitations(budgets, user.id) : undefined;

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "group" })}</Heading>

			<CardState
				title={t("budgets.title", { ns: "group" })}
				actions={<BudgetModalForm />}
				data={budgets}
				isLoading={isLoading}
				isError={isError}
				errorTitle={t("budgets.error.title", { ns: "group" })}
				errorDescription={t("budgets.error.description", { ns: "group" })}
				emptyTitle={t("budgets.empty.title", { ns: "group" })}
				emptyDescription={t("budgets.empty.description", { ns: "group" })}
				emptyIcon="group"
				skeletonClassName="h-24"
			>
				{(items) => <BudgetsList budgets={items} userId={user.id} />}
			</CardState>

			<CardState
				title={t("invitations.title", { ns: "group" })}
				data={invitations}
				isLoading={isLoading}
				isError={isError}
				errorTitle={t("invitations.error.title", { ns: "group" })}
				errorDescription={t("invitations.error.description", {
					ns: "group",
				})}
				emptyTitle={t("invitations.empty.title", { ns: "group" })}
				emptyDescription={t("invitations.empty.description", {
					ns: "group",
				})}
				emptyIcon="email"
				skeletonClassName="h-24"
			>
				{(items) => <InvitationsList invitations={items} userId={user.id} />}
			</CardState>
		</div>
	);
};
