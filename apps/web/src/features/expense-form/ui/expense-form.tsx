import { zodResolver } from "@hookform/resolvers/zod";
import {
	type DocumentCreatePayload,
	documentCreatePayloadSchema,
} from "@repo/api/schemas";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	Form,
	FormDatePicker,
	Icon,
	Separator,
	Text,
} from "@/shared/components";
import { formatPrice } from "@/shared/helpers/price";
import { Button } from "@/shared/lib/ui/button";
import { ExpenseLineItem } from "./expense-line-item";

export const ExpenseForm = () => {
	const { t, i18n } = useTranslation();
	// const { signIn, isLoading } = useSignIn({
	// 	onSuccess: data => {
	// 		storeToken(data.data.token)
	// 	},
	// 	onError: () => {
	// 		toast.error(t('toast.error.signed_in', { ns: 'common' }))
	// 	},
	// })

	const form = useForm<DocumentCreatePayload>({
		resolver: zodResolver(documentCreatePayloadSchema),
		defaultValues: {
			date: new Date(),
			lineItems: [{ title: "", singleAmount: 0, quantity: 1 }],
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
		console.log(data);
	}

	return (
		<Form
			onSubmit={form.handleSubmit(onSubmit)}
			submitText={t("action.create", { ns: "common" })}
			submitDisabled={false}
			isLoading={false}
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
							t={t}
							form={form}
							remove={remove}
							language={i18n.language}
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
