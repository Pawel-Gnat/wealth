import { zodResolver } from "@hookform/resolvers/zod";
import { recordCreatePayloadSchema, recordKindSchema } from "@repo/api/schemas";
import type {
	RecordCreatePayload,
	RecordCreateResponse,
	RecordKind,
	RecordUpdateResponse,
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
import { controlledAsync } from "@/shared/helpers/controlled-fetch";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type RecordUpsertResponse = RecordCreateResponse | RecordUpdateResponse;

export const recordFormSchema = recordCreatePayloadSchema.extend({
	kind: recordKindSchema,
});

export type RecordFormValues = RecordCreatePayload & { kind: RecordKind };

const DEFAULT_RECORD_VALUES: RecordCreatePayload = {
	date: new Date(),
	lineItems: [{ title: "", singleAmount: 1, quantity: 1 }],
};

export type UseUpsertDocumentProps = {
	kind?: RecordKind;
	documentId?: string;
	initialValues?: RecordFormValues;
};

export function useUpsertDocument({
	kind,
	documentId,
	initialValues,
}: UseUpsertDocumentProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isEditMode = Boolean(documentId);
	const defaultValues = {
		...(initialValues ?? DEFAULT_RECORD_VALUES),
		...(kind ? { kind } : {}),
	} as RecordFormValues;

	const form = useForm<RecordFormValues>({
		resolver: zodResolver(recordFormSchema) as Resolver<RecordFormValues>,
		defaultValues,
	});

	useEffect(() => {
		if (initialValues) {
			form.reset(initialValues);
		}
	}, [form, initialValues]);

	const mutation = useMutation<RecordUpsertResponse, Error, RecordFormValues>({
		mutationFn: (payload) =>
			runWithRequestId(async () => {
				const config = getDocumentConfig(payload.kind);
				const normalizedPayload = {
					...payload,
					date: normalizeDocumentDateForApi(payload.date),
				};

				const data = documentId
					? await controlledAsync<RecordUpsertResponse>(async () => {
							const { kind: recordKind, ...updatePayload } = normalizedPayload;
							return config.client.update({
								id: documentId,
								kind: recordKind,
								...updatePayload,
							});
						})
					: await controlledAsync<RecordUpsertResponse>(async () =>
							config.client.create(normalizedPayload),
						);

				const isUpdated = data.data.message === config.updatedMessage;
				logger.info(isUpdated ? config.events.update : config.events.create);
				return data;
			}),
		onSuccess: (_data, payload) => {
			const config = getDocumentConfig(payload.kind);
			void queryClient.invalidateQueries({
				queryKey: queryKeys.dashboard.all(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.records.all(),
			});
			toast.success(
				t(isEditMode ? config.toast.updated : config.toast.created, {
					ns: "common",
				}),
			);
			navigate(config.listRoute);
		},
		onError: (_error, payload) => {
			const config = getDocumentConfig(payload.kind);
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
			mutation.mutate(data);
		}),
	};
}
