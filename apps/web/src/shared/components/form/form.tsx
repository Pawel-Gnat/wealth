import type { ReactNode, SubmitEventHandler } from "react";
import { ButtonPrimary } from "@/shared/components/button";
import { cn } from "@/shared/lib/tailwind/utils";

type FormProps = {
	onSubmit: SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
	className?: string;
	submitText?: string;
	submitDisabled?: boolean;
	isLoading?: boolean;
};

export const Form = ({
	onSubmit,
	children,
	className,
	submitText = "Submit",
	submitDisabled = false,
	isLoading = false,
}: FormProps) => {
	return (
		<form onSubmit={onSubmit} className={cn("space-y-6", className)}>
			<div className="space-y-4">{children}</div>
			<div className="flex *:w-full">
				<ButtonPrimary
					type="submit"
					disabled={submitDisabled || isLoading}
					isLoading={isLoading}
				>
					{submitText}
				</ButtonPrimary>
			</div>
		</form>
	);
};
