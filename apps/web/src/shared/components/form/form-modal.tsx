import { cn } from "cn";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/lib/ui/dialog";
import { ButtonPrimary, ButtonSecondary } from "../button";
import { ButtonInput } from "../button/button";
import { Icon, type IconName } from "../icons";

type FormModalProps = {
	triggerText: string;
	triggerIcon?: IconName;
	title: string;
	description?: string;
	children: React.ReactNode;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	className?: string;
	disabled?: boolean;
	isPending?: boolean;
	submitText: string;
	closeText?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const FormModal = ({
	triggerText,
	triggerIcon,
	title,
	description,
	children,
	closeText,
	onSubmit,
	className,
	disabled = false,
	isPending = false,
	submitText,
	open,
	onOpenChange,
}: FormModalProps) => {
	const { t } = useTranslation();

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (isPending && !nextOpen) return;
				onOpenChange(nextOpen);
			}}
		>
			<DialogTrigger asChild>
				<ButtonSecondary>
					{triggerIcon && <Icon name={triggerIcon} />}
					{triggerText}
				</ButtonSecondary>
			</DialogTrigger>
			<DialogContent
				className="sm:max-w-md"
				showCloseButton={false}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<form onSubmit={onSubmit} className={cn("space-y-6", className)}>
					<div className="space-y-4">{children}</div>
					<DialogFooter className="">
						<DialogClose asChild>
							<ButtonInput disabled={isPending}>
								{closeText || t("action.cancel", { ns: "common" })}
							</ButtonInput>
						</DialogClose>
						<ButtonPrimary
							type="submit"
							disabled={disabled || isPending}
							isLoading={isPending}
						>
							{submitText}
						</ButtonPrimary>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
