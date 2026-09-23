import { cn } from "cn";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/lib/ui/alert-dialog";
import { Button } from "../button";

type AlertModalProps = {
	open?: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description?: React.ReactNode;
	cancelText: React.ReactNode;
	confirmText: React.ReactNode;
	onConfirm: () => void;
	isConfirming?: boolean;
	className?: string;
};

export const AlertModal = ({
	open,
	onOpenChange,
	title,
	description,
	cancelText,
	confirmText,
	onConfirm,
	isConfirming = false,
	className,
}: AlertModalProps) => {
	const handleOpenChange = (nextOpen: boolean) => {
		if (isConfirming && !nextOpen) {
			return;
		}
		onOpenChange(nextOpen);
	};

	return (
		<AlertDialog
			{...(open !== undefined && { open })}
			onOpenChange={handleOpenChange}
		>
			<AlertDialogContent className={cn("rounded-lg", className)}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description && (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					)}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button
						variant="outline"
						disabled={isConfirming}
						onClick={() => handleOpenChange(false)}
					>
						{cancelText}
					</Button>
					<Button
						variant="destructive"
						disabled={isConfirming}
						isLoading={isConfirming}
						onClick={onConfirm}
					>
						{confirmText}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
