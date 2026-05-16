import { zodResolver } from "@hookform/resolvers/zod";
import {
	type DocumentCreatePayload,
	documentCreatePayloadSchema,
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
import { useUpsertIncome } from "../hooks/use-upsert-income";
import { IncomeLineItem } from "./income-line-item";

type IncomeFormValues = DocumentCreatePayload;

const DEFAULT_VALUES: IncomeFormValues = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

type IncomeFormProps = {
	incomeId?: string;
	initialValues?: IncomeFormValues;
};

export const IncomeForm = ({ incomeId, initialValues }: IncomeFormProps) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const isEditMode = Boolean(incomeId);
	const defaultValues = initialValues ?? DEFAULT_VALUES;

	const form = useForm<IncomeFormValues>({
		resolver: zodResolver(
			documentCreatePayloadSchema,
		) as Resolver<IncomeFormValues>,
		defaultValues,
	});

	useEffect(() => {
		if (initialValues) {
			form.reset(initialValues);
		}
	}, [form, initialValues]);

	const { upsertIncome, isLoading } = useUpsertIncome({
		onSuccess: () => {
			toast.success(
				t(
					isEditMode
						? "toast.success.income_updated"
						: "toast.success.income_created",
					{ ns: "common" },
				),
			);
			navigate(APP_ROUTES.incomes.list);
		},
		onError: () => {
			toast.error(
				t(
					isEditMode
						? "toast.error.income_updated"
						: "toast.error.income_created",
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

	function onSubmit(data: IncomeFormValues) {
		upsertIncome(incomeId ? { ...data, id: incomeId } : data);
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
				<Text weight="medium">{t("single.incomes", { ns: "incomes" })}</Text>
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
						<IncomeLineItem
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
