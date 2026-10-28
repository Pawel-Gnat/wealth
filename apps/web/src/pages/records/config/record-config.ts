import type { RecordKind } from "@repo/api/types";
import type { ParseKeys, ParseNsKeys } from "@repo/common/i18n";
import { APP_ROUTES } from "@/app/routes";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";

type RecordToast = {
	created: ParseKeys<"common">;
	updated: ParseKeys<"common">;
	createError: ParseKeys<"common">;
	updateError: ParseKeys<"common">;
	deleted: ParseKeys<"common">;
	deleteError: ParseKeys<"common">;
};

type FormLineItemTitleLabelNsKey = Extract<
	ParseNsKeys<"form">,
	`form:line-item.${string}-label`
>;

export type LineItemTitleLabelKey =
	FormLineItemTitleLabelNsKey extends `form:${infer Key}` ? Key : never;

const recordToast = (toast: RecordToast): RecordToast => toast;

const sharedRecordConfig = {
	i18nNamespace: "records",
	listRoute: APP_ROUTES.records.list,
	addRoute: APP_ROUTES.records.add,
	viewRoute: APP_ROUTES.records.view,
	editRoute: APP_ROUTES.records.edit,
	queryKeys: queryKeys.records,
	client: orpcClient.records,
} as const;

export const RECORD_CONFIG = {
	expense: {
		...sharedRecordConfig,
		lineItemLabelKey: "line-item.expense-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "line-items.expense",
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

export const getRecordConfig = (kind: RecordKind) => {
	return RECORD_CONFIG[kind];
};
