import type { DocumentCreatePayload } from "@repo/api/schemas";
import type { TFunction } from "i18next";
import type { UseFormReturn } from "react-hook-form";
import { ButtonDestructive, FormInput, Icon, Text } from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";

type ExpenseLineItemProps = {
	index: number;
	t: TFunction;
	form: UseFormReturn<DocumentCreatePayload>;
	remove: (index: number) => void;
	language: string;
	lineTotal: number;
};

export const ExpenseLineItem = ({
	index,
	t,
	form,
	remove,
	language,
	lineTotal,
}: ExpenseLineItemProps) => {
	return (
		<div className="grid grid-cols-[1fr_160px_160px_auto_40px] items-end gap-2">
			<FormInput
				name={`lineItems.${index}.title`}
				label={t("expense-line-item.title", { ns: "form" })}
				placeholder={t("expense-line-item.placeholder", { ns: "form" })}
				control={form.control}
			/>

			<FormInput
				name={`lineItems.${index}.singleAmount`}
				label={t("expense-line-item.price", { ns: "form" })}
				placeholder={t("common.price", { ns: "common" })}
				type="number"
				step="0.01"
				control={form.control}
			/>

			<FormInput
				name={`lineItems.${index}.quantity`}
				label={t("expense-line-item.quantity", { ns: "form" })}
				placeholder={t("common.quantity", { ns: "common" })}
				type="number"
				step="1"
				control={form.control}
			/>

			<div className="py-2 px-4 bg-input/50 rounded-3xl">
				<Text size="sm" weight="medium">
					{formatPrice(lineTotal, language)}
				</Text>
			</div>

			<ButtonDestructive size="icon" onClick={() => remove(index)}>
				<Icon name="delete" />
			</ButtonDestructive>
		</div>
	);
};
