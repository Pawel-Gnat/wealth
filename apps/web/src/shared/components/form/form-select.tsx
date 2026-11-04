import type { ReactNode } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/lib/ui/select";
import { FormBase, type FormControlFunction } from "./form-base";

type FormSelectOption = {
	value: string;
	label: ReactNode;
};

export const FormSelect: FormControlFunction<{
	options: FormSelectOption[];
	disabled?: boolean;
}> = ({ options, disabled, ...props }) => {
	return (
		<FormBase {...props}>
			{({ onChange, onBlur, ...field }) => (
				<Select
					{...field}
					{...(disabled === undefined ? {} : { disabled })}
					onValueChange={onChange}
				>
					<SelectTrigger
						aria-invalid={field["aria-invalid"]}
						id={field.id}
						onBlur={onBlur}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</FormBase>
	);
};
