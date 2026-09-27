import { zodResolver } from "@hookform/resolvers/zod";
import { documentCreatePayloadSchema } from "@repo/api/schemas";
import type {
	DocumentCreatePayload,
	DocumentUpdatePayload,
	ExpenseDocumentCreateResponse,
	ExpenseDocumentUpdateResponse,
	IncomeDocumentCreateResponse,
	IncomeDocumentUpdateResponse,
} from "@repo/api/types";
import { normalizeDocumentDateForApi } from "@repo/common/helpers";
import { logger, runWithRequestId } from "@repo/observability/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type DocumentUpsertResponse =
	| ExpenseDocumentCreateResponse
	| ExpenseDocumentUpdateResponse
	| IncomeDocumentCreateResponse
	| IncomeDocumentUpdateResponse;

const DEFAULT_DOCUMENT_VALUES: DocumentCreatePayload = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

export type UseUpsertDocumentProps = {
	kind: RecordKind;
	documentId?: string;
	initialValues?: DocumentCreatePayload;
};

export function useUpsertDocument({
	kind,
	documentId,
	initialValues,
}: UseUpsertDocumentProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const config = getDocumentConfig(kind);
	const queryClient = useQueryClient();
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

	const mutation = useMutation<
		DocumentUpsertResponse,
		Error,
		DocumentCreatePayload | DocumentUpdatePayload
	>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const normalizedPayload = {
					...payload,
					date: normalizeDocumentDateForApi(payload.date),
				};

				const data =
					"id" in normalizedPayload
						? await controlledAsync<DocumentUpsertResponse>(async () => {
								const { id, ...updatePayload } = normalizedPayload;
								return config.client.update({ id, ...updatePayload });
							})
						: await controlledAsync<DocumentUpsertResponse>(async () =>
								config.client.create(normalizedPayload),
							);

				const isUpdated = data.data.message === config.updatedMessage;
				logger.info(isUpdated ? config.events.update : config.events.create);
				return data;
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.all(),
			});
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

	return {
		form,
		isPending: mutation.isPending,
		isEditMode,
		onSubmit: form.handleSubmit((data) => {
			mutation.mutate(documentId ? { ...data, id: documentId } : data);
		}),
	};
}
