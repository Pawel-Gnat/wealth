import { zodResolver } from "@hookform/resolvers/zod";
import { documentCreatePayloadSchema } from "@repo/api/schemas";
import type { DocumentCreatePayload } from "@repo/api/types";
import { useEffect } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { Form } from "@/shared/components";
import { useUpsertDocument } from "../hooks/use-upsert-document";
import { DocumentFields } from "./document-fields";

export type DocumentFormProps = {
	kind: RecordKind;
	documentId?: string;
	initialValues?: DocumentCreatePayload;
};

export const DEFAULT_DOCUMENT_VALUES: DocumentCreatePayload = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

export const DocumentForm = ({
	kind,
	documentId,
	initialValues,
}: DocumentFormProps) => {
	const config = getDocumentConfig(kind);
	const { t } = useTranslation();
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

	const { upsertDocument, isPending } = useUpsertDocument({
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

	function onSubmit(data: DocumentCreatePayload) {
		upsertDocument(documentId ? { ...data, id: documentId } : data);
	}

	return (
		<Form
			onSubmit={form.handleSubmit(onSubmit)}
			submitText={t(isEditMode ? "action.save" : "action.create", {
				ns: "common",
			})}
			isPending={isPending}
		>
			<DocumentFields form={form} kind={kind} />
		</Form>
	);
};
