import { zodResolver } from "@hookform/resolvers/zod";
import {
	type DocumentCreatePayload,
	documentCreatePayloadSchema,
} from "@repo/api/schemas";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	Form,
	FormDatePicker,
	Icon,
	Separator,
	Text,
} from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";
import { Button } from "@/shared/lib/ui/button";
import { useInsertExpense } from "../hooks/use-insert-expense";
import { ExpenseLineItem } from "./expense-line-item";

const DEFAULT_VALUES: DocumentCreatePayload = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

export const ExpenseForm = () => {
	const { t, i18n } = useTranslation();

	const form = useForm<DocumentCreatePayload>({
		resolver: zodResolver(documentCreatePayloadSchema),
		defaultValues: DEFAULT_VALUES,
	});
	const { insertExpense, isLoading } = useInsertExpense({
		onSuccess: () => {
			toast.success(t("toast.success.expense_created", { ns: "common" }));
			form.reset(DEFAULT_VALUES);
		},
		onError: () => {
			toast.error(t("toast.error.expense_created", { ns: "common" }));
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "lineItems",
	});
	const watchedLineItems = useWatch({
		control: form.control,
		name: "lineItems",
	});
	const totalAmount = watchedLineItems.reduce((sum, item) => {
		return sum + item.singleAmount * item.quantity;
	}, 0);

	function onSubmit(data: DocumentCreatePayload) {
		insertExpense(data);
	}

	return (
		<Form
			onSubmit={form.handleSubmit(onSubmit)}
			submitText={t("action.create", { ns: "common" })}
			submitDisabled={isLoading}
			isLoading={isLoading}
		>
			<FormDatePicker
				name="date"
				label={t("date.label", { ns: "form" })}
				control={form.control}
			/>

			<div className="flex items-center justify-between">
				<Text weight="medium">{t("single.expenses", { ns: "expenses" })}</Text>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => append({ title: "", singleAmount: 0, quantity: 1 })}
				>
					<Icon name="add" className="mr-1" />
					{t("action.add", { ns: "common" })}
				</Button>
			</div>
			<Separator orientation="horizontal" />

			<div className="space-y-4">
				{fields.map((field, index) => {
					const current = watchedLineItems[index];
					const lineTotal =
						(current?.singleAmount ?? 0) * (current?.quantity ?? 1);

					return (
						<ExpenseLineItem
							key={field.id}
							index={index}
							form={form}
							remove={remove}
							lineTotal={lineTotal}
						/>
					);
				})}
			</div>

			<Text size="lg" weight="medium" className="text-right">
				{formatPrice(totalAmount, i18n.language)}
			</Text>
		</Form>
	);
};
