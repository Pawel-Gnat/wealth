import { zodResolver } from "@hookform/resolvers/zod";
import {
	type DocumentUpsertPayload,
	documentUpsertPayloadSchema,
} from "@repo/api/schemas";
import { useEffect } from "react";
import {
	type Resolver,
	useFieldArray,
	useForm,
	useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/app/router";
import {
	Form,
	FormDatePicker,
	Icon,
	Separator,
	Text,
} from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";
import { Button } from "@/shared/lib/ui/button";
import { useUpsertExpense } from "../hooks/use-upsert-expense";
import { ExpenseLineItem } from "./expense-line-item";

type ExpenseFormValues = Omit<DocumentUpsertPayload, "id">;

const DEFAULT_VALUES: ExpenseFormValues = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

type ExpenseFormProps = {
	expenseId?: string;
	initialValues?: ExpenseFormValues;
};

export const ExpenseForm = ({ expenseId, initialValues }: ExpenseFormProps) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const isEditMode = Boolean(expenseId);
	const defaultValues = initialValues ?? DEFAULT_VALUES;

	const form = useForm<ExpenseFormValues>({
		resolver: zodResolver(
			documentUpsertPayloadSchema.omit({ id: true }),
		) as Resolver<ExpenseFormValues>,
		defaultValues,
	});

	useEffect(() => {
		if (initialValues) {
			form.reset(initialValues);
		}
	}, [form, initialValues]);

	const { upsertExpense, isLoading } = useUpsertExpense({
		onSuccess: () => {
			toast.success(
				t(
					isEditMode
						? "toast.success.expense_updated"
						: "toast.success.expense_created",
					{ ns: "common" },
				),
			);
			navigate(APP_ROUTES.expenses.list);
		},
		onError: () => {
			toast.error(
				t(
					isEditMode
						? "toast.error.expense_updated"
						: "toast.error.expense_created",
					{ ns: "common" },
				),
			);
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

	function onSubmit(data: ExpenseFormValues) {
		upsertExpense(expenseId ? { ...data, id: expenseId } : data);
	}

	return (
		<Form
			onSubmit={form.handleSubmit(onSubmit)}
			submitText={t(isEditMode ? "action.save" : "action.create", {
				ns: "common",
			})}
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
