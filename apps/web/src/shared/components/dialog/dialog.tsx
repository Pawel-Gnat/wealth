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
import { Button } from "../button";

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
				<Button>{triggerText}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children}
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<Button>{closeText || t("action.cancel", { ns: "common" })}</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</DialogUI>
	);
};
