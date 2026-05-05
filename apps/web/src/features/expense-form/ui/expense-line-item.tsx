import type { DocumentCreatePayload } from "@repo/api/schemas";

import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ButtonDestructive, FormInput, Icon, Text } from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";

type ExpenseLineItemProps = {
	index: number;
	form: UseFormReturn<DocumentCreatePayload>;
	remove: (index: number) => void;
	lineTotal: number;
};

export const ExpenseLineItem = ({
	index,
	form,
	remove,
	lineTotal,
}: ExpenseLineItemProps) => {
	const { t, i18n } = useTranslation();

	return (
		<div className="grid grid-cols-[1fr_160px_160px_auto_40px] items-end gap-2">
			<FormInput
				name={`lineItems.${index}.title`}
				label={t("expense-line-item.label", { ns: "form" })}
				placeholder={t("expense-line-item.placeholder", { ns: "form" })}
				required
				control={form.control}
			/>

			<FormInput
				name={`lineItems.${index}.singleAmount`}
				label={t("single-amount.label", { ns: "form" })}
				placeholder="0.01"
				type="number"
				step="0.01"
				min="0.01"
				valueAsNumber
				control={form.control}
			/>

			<FormInput
				name={`lineItems.${index}.quantity`}
				label={t("quantity.label", { ns: "form" })}
				placeholder="1"
				type="number"
				step="1"
				min="1"
				valueAsNumber
				control={form.control}
			/>

			<div className="py-2 px-4 bg-input/50 rounded-3xl">
				<Text size="sm" weight="medium">
					{formatPrice(lineTotal, i18n.language)}
				</Text>
			</div>

			<ButtonDestructive size="icon" onClick={() => remove(index)}>
				<Icon name="delete" />
			</ButtonDestructive>
		</div>
	);
};
