import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertModal } from "@/shared/components";
import { getDocumentConfig } from "@/shared/config/document-config";
import type { RecordKind } from "@/shared/types/record-kind";
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
	const config = getDocumentConfig(kind);
	const { t } = useTranslation();
	const { deleteDocument, isLoading } = useDeleteDocument({
		kind,
		onSuccess: () => {
			toast.success(t(config.toast.deleted, { ns: "common" }));
			onClose();
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
