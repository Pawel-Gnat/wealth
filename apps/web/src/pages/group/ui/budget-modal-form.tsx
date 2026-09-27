import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormInput, FormModal } from "@/shared/components";
import { useCreateGroupBudgetForm } from "../hooks/use-create-group-budget-form";

export const BudgetModalForm = () => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const { control, isPending, reset, createGroupBudget } =
		useCreateGroupBudgetForm({
			onCreated: () => setIsOpen(false),
		});

	return (
		<FormModal
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) {
					reset();
				}
			}}
			triggerText={t("action.create", { ns: "common" })}
			triggerIcon="add"
			title={t("title", { ns: "group" })}
			isPending={isPending}
			onSubmit={createGroupBudget}
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
