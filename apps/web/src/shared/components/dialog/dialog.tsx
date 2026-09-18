import { useTranslation } from "react-i18next";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Dialog as DialogUI,
} from "@/shared/lib/ui/dialog";
import { ButtonPrimary } from "../button";

type DialogProps = {
	triggerText: string;
	title: string;
	description?: string;
	children: React.ReactNode;
	closeText?: string;
};

export const Dialog = ({
	triggerText,
	title,
	description,
	children,
	closeText,
}: DialogProps) => {
	const { t } = useTranslation();

	return (
		<DialogUI>
			<DialogTrigger asChild>
				<ButtonPrimary>{triggerText}</ButtonPrimary>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children}
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<ButtonPrimary>
							{closeText || t("action.cancel", { ns: "common" })}
						</ButtonPrimary>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</DialogUI>
	);
};
