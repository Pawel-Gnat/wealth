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
import {
	calculateDocumentTotal,
	calculateLineTotal,
	DEFAULT_DOCUMENT_VALUES,
	EMPTY_LINE_ITEM,
} from "@/features/document/model/defaults";
import {
	Form,
	FormDatePicker,
	Icon,
	Separator,
	Text,
} from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import { formatPrice } from "@/shared/helpers/price";
import { Button } from "@/shared/lib/ui/button";
import type { RecordKind } from "@/shared/types/record-kind";
import { useUpsertDocument } from "../hooks/use-upsert-document";
import { DocumentLineItem } from "./document-line-item";

export type DocumentFormProps = {
	kind: RecordKind;
	documentId?: string;
	initialValues?: DocumentCreatePayload;
};

export const DocumentForm = ({
	kind,
	documentId,
	initialValues,
}: DocumentFormProps) => {
	const config = getDocumentConfig(kind);
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const isEditMode = Boolean(documentId);
	const defaultValues = initialValues ?? DEFAULT_DOCUMENT_VALUES;

	const form = useForm<DocumentCreatePayload>({
		resolver: zodResolver(
			documentCreatePayloadSchema,
		) as Resolver<DocumentCreatePayload>,
		defaultValues,
	});

	useEffect(() => {
		if (initialValues) {
			form.reset(initialValues);
		}
	}, [form, initialValues]);

	const { upsertDocument, isLoading } = useUpsertDocument({
		kind,
		onSuccess: () => {
			toast.success(
				t(isEditMode ? config.toast.updated : config.toast.created, {
					ns: "common",
				}),
			);
			navigate(config.listRoute);
		},
		onError: () => {
			toast.error(
				t(isEditMode ? config.toast.updateError : config.toast.createError, {
					ns: "common",
				}),
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
	const totalAmount = calculateDocumentTotal(watchedLineItems ?? []);

	function onSubmit(data: DocumentCreatePayload) {
		upsertDocument(documentId ? { ...data, id: documentId } : data);
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

			<Text size="lg" weight="medium" className="text-right">
				{formatPrice(totalAmount, i18n.language)}
			</Text>
		</Form>
	);
};
