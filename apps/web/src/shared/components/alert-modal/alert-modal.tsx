import { cn } from "@/shared/lib/tailwind/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/lib/ui/alert-dialog";

type AlertModalProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
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
	return (
		<AlertDialog
			{...(open !== undefined && { open })}
			{...(onOpenChange && { onOpenChange })}
		>
			<AlertDialogContent className={cn("rounded-lg", className)}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description && (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					)}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isConfirming} className="rounded-lg">
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
						disabled={isConfirming}
						className="rounded-lg"
					>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
