import type { RecordKind } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/app/routes";
import { AlertModal } from "@/shared/components";
import { getRecordConfig } from "../../config/record-config";
import { useDeleteRecord } from "../hooks/use-delete-record";

type RecordDeleteDialogProps = {
	id: string;
	kind: RecordKind;
	onClose: () => void;
};

export const RecordDeleteDialog = ({
	id,
	kind,
	onClose,
}: RecordDeleteDialogProps) => {
	const { t } = useTranslation();
	const { budgetId } = useParams();
	const config = getRecordConfig(kind);
	const navigate = useNavigate();

	const { deleteRecord, isLoading } = useDeleteRecord({
		kind,
		onSuccess: () => {
			toast.success(t(config.toast.deleted, { ns: "common" }));
			onClose();
			navigate(budgetId ? APP_ROUTES.budgets.view(budgetId) : config.listRoute);
		},
		onError: () => {
			toast.error(t(config.toast.deleteError, { ns: "common" }));
		},
	});

	const kindText = {
		expense: {
			title: t("delete.expense.title", { ns: "records" }),
			description: t("delete.expense.description", { ns: "records" }),
		},
		income: {
			title: t("delete.income.title", { ns: "records" }),
			description: t("delete.income.description", { ns: "records" }),
		},
	}[kind];

	return (
		<AlertModal
			open
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
			title={kindText.title}
			description={kindText.description}
			cancelText={t("action.cancel", { ns: "common" })}
			confirmText={t("action.delete", { ns: "common" })}
			onConfirm={() => {
				deleteRecord(id);
			}}
			isConfirming={isLoading}
		/>
	);
};
