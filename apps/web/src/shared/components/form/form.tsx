import type { ReactNode } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Button } from "@/shared/lib/ui/button";
import { Field, FieldGroup } from "@/shared/lib/ui/field";
import { cn } from "@/shared/lib/utils";

type FormProps = {
	onSubmit: SubmitHandler<unknown>;
	children: ReactNode;
	className?: string;
};

export const Form = ({ onSubmit, children, className }: FormProps) => {
	return (
		// <form onSubmit={onSubmit} className={cn("space-y-0", className)}>
		<form onSubmit={onSubmit} className={cn(className)}>
			<FieldGroup>{children}</FieldGroup>
			<Field>
				<Button type="submit">Login</Button>
			</Field>
		</form>
	);
};
