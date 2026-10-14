import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { useDeleteBudget } from "@/pages/budgets/hooks/use-delete-budget";
import { AlertModal, Button, Icon } from "@/shared/components";

type DeleteBudgetDialogProps = {
	budgetId: string;
};

export const DeleteBudgetDialog = ({ budgetId }: DeleteBudgetDialogProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const { deleteBudget, isPending } = useDeleteBudget({
		budgetId,
		onDeleted: () => {
			setIsOpen(false);
			navigate(APP_ROUTES.budgets.list);
		},
	});

	return (
		<>
			<Button variant="destructive" onClick={() => setIsOpen(true)}>
				<Icon name="delete" />
				{t("action.delete", { ns: "common" })}
			</Button>
			<AlertModal
				open={isOpen}
				onOpenChange={setIsOpen}
				title={t("delete.title", { ns: "budgets" })}
				description={t("delete.description", { ns: "budgets" })}
				cancelText={t("action.cancel", { ns: "common" })}
				confirmText={t("action.delete", { ns: "common" })}
				onConfirm={deleteBudget}
				isConfirming={isPending}
			/>
		</>
	);
};
