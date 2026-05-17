import {
	EXPENSE_UPDATED_MESSAGE,
	INCOME_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { APP_ROUTES } from "@/app/routes";
import type { LineItemTitleLabelKey } from "@/features/record-line-items";
import { orpcClient } from "@/shared/lib/orpc/orpc-client";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import type { RecordKind } from "./record-kind";

export const DOCUMENT_CONFIG = {
	expense: {
		i18nNamespace: "expenses",
		lineItemLabelKey: "line-item.expense-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "single.expenses",
		listRoute: APP_ROUTES.expenses.list,
		addRoute: APP_ROUTES.expenses.add,
		editRoute: APP_ROUTES.expenses.edit,
		queryKeys: queryKeys.expenses,
		client: orpcClient.expenses,
		updatedMessage: EXPENSE_UPDATED_MESSAGE,
		logSource: {
			create: "expenses_create",
			update: "expenses_update",
			delete: "expenses_delete",
		},
		toast: {
			created: "toast.success.expense_created",
			updated: "toast.success.expense_updated",
			createError: "toast.error.expense_created",
			updateError: "toast.error.expense_updated",
			deleted: "toast.success.expense_deleted",
			deleteError: "toast.error.expense_deleted",
		},
	},
	income: {
		i18nNamespace: "incomes",
		lineItemLabelKey: "line-item.income-label" satisfies LineItemTitleLabelKey,
		sectionTitleKey: "single.incomes",
		listRoute: APP_ROUTES.incomes.list,
		addRoute: APP_ROUTES.incomes.add,
		editRoute: APP_ROUTES.incomes.edit,
		queryKeys: queryKeys.incomes,
		client: orpcClient.incomes,
		updatedMessage: INCOME_UPDATED_MESSAGE,
		logSource: {
			create: "incomes_create",
			update: "incomes_update",
			delete: "incomes_delete",
		},
		toast: {
			created: "toast.success.income_created",
			updated: "toast.success.income_updated",
			createError: "toast.error.income_created",
			updateError: "toast.error.income_updated",
			deleted: "toast.success.income_deleted",
			deleteError: "toast.error.income_deleted",
		},
	},
} as const;

export function getDocumentConfig(kind: RecordKind) {
	return DOCUMENT_CONFIG[kind];
}
