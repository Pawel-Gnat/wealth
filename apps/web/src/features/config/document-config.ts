import {
	EXPENSE_UPDATED_MESSAGE,
	INCOME_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import type { ParseKeys } from "@repo/common/i18n";
import { getDocumentObservabilityEvents } from "@repo/observability/browser";
import { APP_ROUTES } from "@/app/routes";
import type { RecordKind } from "@/features/model/record-kind";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import type { LineItemTitleLabelKey } from "../../features/model/line-item-title-label-key";

type DocumentToast = {
	created: ParseKeys<"common">;
	updated: ParseKeys<"common">;
	createError: ParseKeys<"common">;
	updateError: ParseKeys<"common">;
	deleted: ParseKeys<"common">;
	deleteError: ParseKeys<"common">;
};

const documentToast = (toast: DocumentToast): DocumentToast => toast;

export const DOCUMENT_CONFIG = {
	expense: {
		i18nNamespace: "expenses",
		lineItemLabelKey: "line-item.expense-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "single.expenses",
		listRoute: APP_ROUTES.expenses.list,
		addRoute: APP_ROUTES.expenses.add,
		viewRoute: APP_ROUTES.expenses.view,
		editRoute: APP_ROUTES.expenses.edit,
		queryKeys: queryKeys.expenses,
		client: orpcClient.expenses,
		updatedMessage: EXPENSE_UPDATED_MESSAGE,
		events: getDocumentObservabilityEvents("expense"),
		toast: documentToast({
			created: "toast.success.expense-created",
			updated: "toast.success.expense-updated",
			createError: "toast.error.expense-created",
			updateError: "toast.error.expense-updated",
			deleted: "toast.success.expense-deleted",
			deleteError: "toast.error.expense-deleted",
		}),
	},
	income: {
		i18nNamespace: "incomes",
		lineItemLabelKey: "line-item.income-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "single.incomes",
		listRoute: APP_ROUTES.incomes.list,
		addRoute: APP_ROUTES.incomes.add,
		viewRoute: APP_ROUTES.incomes.view,
		editRoute: APP_ROUTES.incomes.edit,
		queryKeys: queryKeys.incomes,
		client: orpcClient.incomes,
		updatedMessage: INCOME_UPDATED_MESSAGE,
		events: getDocumentObservabilityEvents("income"),
		toast: documentToast({
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
