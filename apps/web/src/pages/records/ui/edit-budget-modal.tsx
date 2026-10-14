import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormInput, FormModal } from "@/shared/components";
import { useEditBudgetForm } from "../hooks/use-edit-budget-form";

type EditBudgetModalProps = {
	budgetId: string;
	title: string;
};

export const EditBudgetModal = ({ budgetId, title }: EditBudgetModalProps) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const { control, isPending, reset, updateBudget } = useEditBudgetForm({
		budgetId,
		title,
		onUpdated: () => {
			setIsOpen(false);
		},
	});

	const onOpenChange = (open: boolean) => {
		setIsOpen(open);
		reset();
	};

	return (
		<FormModal
			open={isOpen}
			onOpenChange={onOpenChange}
			triggerText={t("action.edit", { ns: "common" })}
			triggerIcon="edit"
			title={t("edit.title", { ns: "budgets" })}
			isPending={isPending}
			submitText={t("action.update", { ns: "common" })}
			onSubmit={updateBudget}
		>
			<FormInput
				name="title"
				label={t("title.label", { ns: "form" })}
				placeholder={t("title.placeholder", { ns: "form" })}
				control={control}
				icon="text"
			/>
		</FormModal>
	);
};
