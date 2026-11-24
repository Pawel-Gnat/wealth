import type { RecordType } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { AlertModal, toast } from "@/shared/components";
import { getRecordConfig } from "../../config/record-config";
import { useDeleteRecord } from "../hooks/use-delete-record";

type RecordDeleteDialogProps = {
	id: string;
	type: RecordType;
	onClose: () => void;
};

export const RecordDeleteDialog = ({
	id,
	type,
	onClose,
}: RecordDeleteDialogProps) => {
	const { t } = useTranslation();
	const { budgetId } = useParams();
	const config = getRecordConfig(type);
	const navigate = useNavigate();

	const { deleteRecord, isLoading } = useDeleteRecord({
		type,
		onSuccess: () => {
			toast.success(t(config.toast.deleted, { ns: "common" }));
			onClose();
			navigate(budgetId ? APP_ROUTES.budgets.view(budgetId) : config.listRoute);
		},
		onError: () => {
			toast.error(t(config.toast.deleteError, { ns: "common" }));
		},
	});

	const typeText = {
		expense: {
			title: t("delete.expense.title", { ns: "records" }),
			description: t("delete.expense.description", { ns: "records" }),
		},
		income: {
			title: t("delete.income.title", { ns: "records" }),
			description: t("delete.income.description", { ns: "records" }),
		},
	}[type];

	return (
		<AlertModal
			open
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
			title={typeText.title}
			description={typeText.description}
			cancelText={t("action.cancel", { ns: "common" })}
			confirmText={t("action.delete", { ns: "common" })}
			onConfirm={() => {
				deleteRecord(id);
			}}
			isConfirming={isLoading}
		/>
	);
};
