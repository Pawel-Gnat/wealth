import { useTranslation } from "react-i18next";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@/shared/lib/ui/alert-dialog";
import { Skeleton } from "../skeleton";

type AlertModalSkeletonProps = {
	onClose: () => void;
};

export const AlertModalSkeleton = ({ onClose }: AlertModalSkeletonProps) => {
	const { t } = useTranslation();

	return (
		<AlertDialog
			open
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<AlertDialogContent>
				<AlertDialogTitle className="sr-only">
					{t("common.loading", { ns: "common" })}
				</AlertDialogTitle>
				<AlertDialogDescription className="sr-only">
					{t("common.loading", { ns: "common" })}
				</AlertDialogDescription>
				<Skeleton className="h-16 w-full" />
			</AlertDialogContent>
		</AlertDialog>
	);
};
