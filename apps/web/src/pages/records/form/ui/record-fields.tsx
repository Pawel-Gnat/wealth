import { recordTypes } from "@repo/api/schemas";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	Button,
	FormDatePicker,
	FormSelect,
	Icon,
	Price,
	Separator,
	Text,
} from "@/shared/components";
import { getRecordConfig } from "../../config/record-config";
import {
	calculateLineTotal,
	calculateRecordTotal,
} from "../helpers/record-totals";
import type { RecordFormValues } from "../hooks/use-upsert-record";
import { RecordLineItem } from "./record-line-item";

const EMPTY_LINE_ITEM: RecordFormValues["lineItems"][number] = {
	title: "",
	singleAmount: 1,
	quantity: 1,
};

type RecordFieldsProps = {
	form: UseFormReturn<RecordFormValues>;
	isKindLocked: boolean;
};

export const RecordFields = ({ form, isKindLocked }: RecordFieldsProps) => {
	const recordType =
		useWatch({ control: form.control, name: "type" }) ?? recordTypes[0];
	const config = getRecordConfig(recordType);
	const { t, i18n } = useTranslation();
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "lineItems",
	});
	const watchedLineItems = useWatch({
		control: form.control,
		name: "lineItems",
	});
	const totalAmount = calculateRecordTotal(watchedLineItems ?? []);

	return (
		<>
			<FormDatePicker
				name="date"
				label={t("date.label", { ns: "form" })}
				control={form.control}
			/>

			<FormSelect
				name="type"
				label={t("single.type", { ns: "records" })}
				control={form.control}
				disabled={isKindLocked}
				options={recordTypes.map((recordType) => ({
					value: recordType,
					label: t(`single.kind.${recordType}`, { ns: "records" }),
				}))}
			/>

			<div className="flex items-center justify-between">
				<Text weight="medium">
					{t(config.sectionTitleKey, { ns: config.i18nNamespace })}
				</Text>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => append(EMPTY_LINE_ITEM)}
				>
					<Icon name="add" />
					{t("action.add", { ns: "common" })}
				</Button>
			</div>
			<Separator orientation="horizontal" />

			<div className="space-y-4">
				{fields.map((field, index) => {
					const current = watchedLineItems?.[index];
					const lineTotal = calculateLineTotal(
						current?.singleAmount,
						current?.quantity,
					);

					return (
						<RecordLineItem
							key={field.id}
							index={index}
							form={form}
							remove={remove}
							lineTotal={lineTotal}
							titleLabelKey={config.lineItemLabelKey}
						/>
					);
				})}
			</div>

			<Price
				size="lg"
				weight="medium"
				className="text-right"
				amount={totalAmount}
				language={i18n.language}
			/>
		</>
	);
};
