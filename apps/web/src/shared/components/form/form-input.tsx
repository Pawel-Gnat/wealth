import type { ComponentProps } from "react";
import { Input } from "@/shared/lib/ui/input";
import { FormBase, type FormControlFunction } from "./form-base";

type FormInputNativeProps = Omit<
	ComponentProps<"input">,
	"name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

export const FormInput: FormControlFunction<FormInputNativeProps> = (props) => {
	const { name, label, description, control, ...inputProps } = props;

	return (
		<FormBase
			name={name}
			label={label}
			description={description}
			control={control}
		>
			{(field) => <Input {...field} {...inputProps} />}
		</FormBase>
	);
};
