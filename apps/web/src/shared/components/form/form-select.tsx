import type { ReactNode } from "react";

import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/shared/lib/ui/select";
import { FormBase, type FormControlFunction } from "./form-base";

export const FormSelect: FormControlFunction<{
	children: ReactNode;
	disabled?: boolean;
}> = ({ children, disabled, ...props }) => {
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
					<SelectContent>{children}</SelectContent>
				</Select>
			)}
		</FormBase>
	);
};
