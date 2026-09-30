import { recordKinds } from "@repo/api/schemas";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getDocumentConfig } from "@/features/config/document-config";
import {
	FormDatePicker,
	FormSelect,
	Icon,
	Price,
	Separator,
	Text,
} from "@/shared/components";
import { Button } from "@/shared/lib/ui/button";
import { SelectItem } from "@/shared/lib/ui/select";
import {
	calculateDocumentTotal,
	calculateLineTotal,
} from "../helpers/document-totals";
import type { RecordFormValues } from "../hooks/use-upsert-document";
import { DocumentLineItem } from "./document-line-item";

const EMPTY_LINE_ITEM: RecordFormValues["lineItems"][number] = {
	title: "",
	singleAmount: 1,
	quantity: 1,
};

type DocumentFieldsProps = {
	form: UseFormReturn<RecordFormValues>;
	isKindLocked: boolean;
};

export const DocumentFields = ({ form, isKindLocked }: DocumentFieldsProps) => {
	const kind =
		useWatch({ control: form.control, name: "kind" }) ?? recordKinds[0];
	const config = getDocumentConfig(kind);
	const { t, i18n } = useTranslation();
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "lineItems",
	});
	const watchedLineItems = useWatch({
		control: form.control,
		name: "lineItems",
	});
	const totalAmount = calculateDocumentTotal(watchedLineItems ?? []);

	return (
		<>
			<FormDatePicker
				name="date"
				label={t("date.label", { ns: "form" })}
				control={form.control}
			/>

			<FormSelect
				name="kind"
				label={t("single.type", { ns: "records" })}
				control={form.control}
				disabled={isKindLocked}
			>
				{recordKinds.map((recordKind) => (
					<SelectItem key={recordKind} value={recordKind}>
						{recordKind}
					</SelectItem>
				))}
			</FormSelect>

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
					<Icon name="add" className="mr-1" />
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
						<DocumentLineItem
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
