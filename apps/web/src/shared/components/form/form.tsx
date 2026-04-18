import type { ReactNode, SubmitEventHandler } from "react";
import { Button } from "@/shared/lib/ui/button";
import { cn } from "@/shared/lib/utils";

type FormProps = {
	onSubmit: SubmitEventHandler<HTMLFormElement>;
	children: ReactNode;
	className?: string;
	submitText?: string;
};

export const Form = ({
	onSubmit,
	children,
	className,
	submitText = "Submit",
}: FormProps) => {
	return (
		<form onSubmit={onSubmit} className={cn("space-y-6", className)}>
			<div className="space-y-4">{children}</div>
			<div className="flex *:w-full">
				<Button type="submit">{submitText}</Button>
			</div>
		</form>
	);
};
