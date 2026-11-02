import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { useUser } from "@/context/auth";
import { Heading } from "@/shared/components";
import { CardState } from "@/shared/widgets/card-state";
import { useBudgetInvites } from "./hooks/use-budget-invites";
import { useBudgets } from "./hooks/use-budgets";
import { BudgetModalForm } from "./ui/budget-modal-form";
import { BudgetsList } from "./ui/budgets-list";
import { InvitationsList } from "./ui/invitations-list";

const INVITATIONS_ID = "invitations";

export const BudgetsPage = () => {
	const { t } = useTranslation();
	const { hash } = useLocation();
	const { data: user } = useUser();
	const { data: budgets, isLoading, isError } = useBudgets();
	const {
		data: invitations,
		isLoading: isInvitesLoading,
		isError: isInvitesError,
	} = useBudgetInvites();

	useEffect(() => {
		if (!user || hash !== `#${INVITATIONS_ID}`) {
			return;
		}

		document.getElementById(INVITATIONS_ID)?.scrollIntoView();
	}, [hash, user]);

	if (!user) {
		return null;
	}

	return (
		<div className="flex flex-col gap-6">
			<Heading>{t("title", { ns: "budgets" })}</Heading>

			<CardState
				title={t("budgets.title", { ns: "budgets" })}
				actions={<BudgetModalForm />}
				data={budgets}
				isLoading={isLoading}
				isError={isError}
				errorTitle={t("budgets.error.title", { ns: "budgets" })}
				errorDescription={t("budgets.error.description", { ns: "budgets" })}
				emptyTitle={t("budgets.empty.title", { ns: "budgets" })}
				emptyDescription={t("budgets.empty.description", { ns: "budgets" })}
				emptyIcon="group"
				skeletonClassName="h-24"
			>
				{(items) => <BudgetsList budgets={items} userId={user.id} />}
			</CardState>

			<CardState
				id={INVITATIONS_ID}
				title={t("invitations.title", { ns: "budgets" })}
				data={invitations}
				isLoading={isInvitesLoading}
				isError={isInvitesError}
				errorTitle={t("invitations.error.title", { ns: "budgets" })}
				errorDescription={t("invitations.error.description", {
					ns: "budgets",
				})}
				emptyTitle={t("invitations.empty.title", { ns: "budgets" })}
				emptyDescription={t("invitations.empty.description", {
					ns: "budgets",
				})}
				emptyIcon="email"
				skeletonClassName="h-24"
			>
				{(items) => <InvitationsList invitations={items} userId={user.id} />}
			</CardState>
		</div>
	);
};
