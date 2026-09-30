import { RECORD_UPDATED_MESSAGE } from "@repo/api/schemas";
import type { ParseKeys } from "@repo/common/i18n";
import { getDocumentObservabilityEvents } from "@repo/observability/browser";
import { APP_ROUTES } from "@/app/routes";
import type { RecordKind } from "@/features/model/record-kind";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import type { LineItemTitleLabelKey } from "../../features/model/line-item-title-label-key";

type RecordToast = {
	created: ParseKeys<"common">;
	updated: ParseKeys<"common">;
	createError: ParseKeys<"common">;
	updateError: ParseKeys<"common">;
	deleted: ParseKeys<"common">;
	deleteError: ParseKeys<"common">;
};

const recordToast = (toast: RecordToast): RecordToast => toast;

const sharedRecordConfig = {
	i18nNamespace: "records",
	listRoute: APP_ROUTES.records.list,
	addRoute: APP_ROUTES.records.add,
	viewRoute: APP_ROUTES.records.view,
	editRoute: APP_ROUTES.records.edit,
	queryKeys: queryKeys.records,
	client: orpcClient.records,
	updatedMessage: RECORD_UPDATED_MESSAGE,
} as const;

export const DOCUMENT_CONFIG = {
	expense: {
		...sharedRecordConfig,
		lineItemLabelKey: "line-item.expense-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "line-items.expense",
		events: getDocumentObservabilityEvents("expense"),
		toast: recordToast({
			created: "toast.success.expense-created",
			updated: "toast.success.expense-updated",
			createError: "toast.error.expense-created",
			updateError: "toast.error.expense-updated",
			deleted: "toast.success.expense-deleted",
			deleteError: "toast.error.expense-deleted",
		}),
	},
	income: {
		...sharedRecordConfig,
		lineItemLabelKey: "line-item.income-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "line-items.income",
		events: getDocumentObservabilityEvents("income"),
		toast: recordToast({
			created: "toast.success.income-created",
			updated: "toast.success.income-updated",
			createError: "toast.error.income-created",
			updateError: "toast.error.income-updated",
			deleted: "toast.success.income-deleted",
			deleteError: "toast.error.income-deleted",
		}),
	},
} as const;

export function getDocumentConfig(kind: RecordKind) {
	return DOCUMENT_CONFIG[kind];
}
