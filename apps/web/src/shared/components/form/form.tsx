import { cn } from "cn";
import type { ReactNode, SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { ButtonPrimary } from "@/shared/components/button";

type FormProps = {
	onSubmit: SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
	className?: string;
	submitText?: string;
	submitDisabled?: boolean;
	isPending?: boolean;
};

export const Form = ({
	onSubmit,
	children,
	className,
	submitText,
	submitDisabled = false,
	isPending = false,
}: FormProps) => {
	const { t } = useTranslation();

	return (
		<form onSubmit={onSubmit} className={cn("space-y-6", className)}>
			<div className="space-y-4">{children}</div>
			<div className="flex *:w-full">
				<ButtonPrimary
					type="submit"
					disabled={submitDisabled || isPending}
					isLoading={isPending}
				>
					{submitText || t("action.save", { ns: "common" })}
				</ButtonPrimary>
			</div>
		</form>
	);
};
