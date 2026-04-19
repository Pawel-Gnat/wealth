import type { ReactNode, SubmitEventHandler } from "react";
import { Button } from "@/shared/lib/ui/button";
import { cn } from "@/shared/lib/utils";

type FormProps = {
	onSubmit: SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
	className?: string;
	submitText?: string;
	submitDisabled?: boolean;
};

export const Form = ({
	onSubmit,
	children,
	className,
	submitText = "Submit",
	submitDisabled = false,
}: FormProps) => {
	return (
		<form onSubmit={onSubmit} className={cn("space-y-6", className)}>
			<div className="space-y-4">{children}</div>
			<div className="flex *:w-full">
				<Button type="submit" disabled={submitDisabled}>
					{submitText}
				</Button>
			</div>
		</form>
	);
};
