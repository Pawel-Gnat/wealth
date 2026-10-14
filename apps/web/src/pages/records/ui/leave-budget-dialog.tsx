import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { AlertModal, Button, Icon } from "@/shared/components";
import { useLeaveBudget } from "../hooks/use-leave-budget";

type LeaveBudgetDialogProps = {
	budgetId: string;
};

export const LeaveBudgetDialog = ({ budgetId }: LeaveBudgetDialogProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const { leaveBudget, isPending } = useLeaveBudget({
		budgetId,
		onLeft: () => {
			setIsOpen(false);
			navigate(APP_ROUTES.budgets.list);
		},
	});

	return (
		<>
			<Button variant="destructive" onClick={() => setIsOpen(true)}>
				<Icon name="leave" />
				{t("action.leave", { ns: "common" })}
			</Button>
			<AlertModal
				open={isOpen}
				onOpenChange={setIsOpen}
				title={t("leave.title", { ns: "budgets" })}
				description={t("leave.description", { ns: "budgets" })}
				cancelText={t("action.cancel", { ns: "common" })}
				confirmText={t("action.leave", { ns: "common" })}
				onConfirm={leaveBudget}
				isConfirming={isPending}
			/>
		</>
	);
};
