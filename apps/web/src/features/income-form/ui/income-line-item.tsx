import type { DocumentCreatePayload } from "@repo/api/schemas";

import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ButtonDestructive, FormInput, Icon, Text } from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";

type IncomeLineItemProps = {
	index: number;
	form: UseFormReturn<DocumentCreatePayload>;
	remove: (index: number) => void;
	lineTotal: number;
};

export const IncomeLineItem = ({
	index,
	form,
	remove,
	lineTotal,
}: IncomeLineItemProps) => {
	const { t, i18n } = useTranslation();

	return (
		<div className="flex flex-col gap-4 border-b pb-4 last:border-b-0 last:pb-0">
			<FormInput
				name={`lineItems.${index}.title`}
				label={t("line-item.income-label", { ns: "form" })}
				placeholder={t("line-item.placeholder", { ns: "form" })}
				control={form.control}
			/>

			<div className="flex flex-row gap-2 items-end">
				<FormInput
					name={`lineItems.${index}.singleAmount`}
					label={t("single-amount.label", { ns: "form" })}
					placeholder="0.01"
					type="number"
					step="0.01"
					valueAsNumber
					control={form.control}
				/>

				<FormInput
					name={`lineItems.${index}.quantity`}
					label={t("quantity.label", { ns: "form" })}
					placeholder="1"
					type="number"
					step="1"
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
		</div>
	);
};
