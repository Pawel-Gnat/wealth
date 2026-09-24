import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getDocumentConfig } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { AlertModal } from "@/shared/components";
import { useDeleteDocument } from "../hooks/use-delete-document";

type DocumentDeleteDialogProps = {
	id: string;
	kind: RecordKind;
	onClose: () => void;
};

export const DocumentDeleteDialog = ({
	id,
	kind,
	onClose,
}: DocumentDeleteDialogProps) => {
	const { t } = useTranslation();
	const config = getDocumentConfig(kind);
	const navigate = useNavigate();

	const { deleteDocument, isLoading } = useDeleteDocument({
		kind,
		onSuccess: () => {
			toast.success(t(config.toast.deleted, { ns: "common" }));
			onClose();
			navigate(config.listRoute);
		},
		onError: () => {
			toast.error(t(config.toast.deleteError, { ns: "common" }));
		},
	});

	return (
		<AlertModal
			open
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
			title={t("delete.title", { ns: config.i18nNamespace })}
			description={t("delete.description", { ns: config.i18nNamespace })}
			cancelText={t("action.cancel", { ns: "common" })}
			confirmText={t("action.delete", { ns: "common" })}
			onConfirm={() => {
				deleteDocument(id);
			}}
			isConfirming={isLoading}
		/>
	);
};
