import type { ReactNode } from "react";
import { useId } from "react";
import { Field, FieldLabel } from "@/shared/lib/ui/field";
import {
	SelectContent,
	SelectItem,
	Select as SelectRoot,
	SelectTrigger,
	SelectValue,
} from "@/shared/lib/ui/select";

type SelectOption = {
	value: string;
	label: ReactNode;
};

type SelectProps = {
	label: ReactNode;
	value: string;
	options: SelectOption[];
	onValueChange: (value: string) => void;
	className?: string;
};

export const Select = ({
	label,
	value,
	options,
	onValueChange,
	className,
}: SelectProps) => {
	const id = useId();

	return (
		<Field className={className}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<SelectRoot value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</SelectRoot>
		</Field>
	);
};
