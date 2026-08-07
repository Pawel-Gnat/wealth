import type { ComponentProps } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/shared/lib/ui/input-group";
import { Icon, type IconName } from "../icons";
import { FormBase, type FormControlFunction } from "./form-base";

type FormInputNativeProps = Omit<
	ComponentProps<"input">,
	"name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
> & {
	valueAsNumber?: boolean;
	icon?: IconName;
};

export const FormInput: FormControlFunction<FormInputNativeProps> = (props) => {
	const {
		name,
		label,
		description,
		control,
		valueAsNumber,
		icon,
		...inputProps
	} = props;

	return (
		<FormBase
			name={name}
			label={label}
			description={description}
			control={control}
		>
			{(field) => (
				<InputGroup>
					{icon && (
						<InputGroupAddon>
							<Icon name={icon} />
						</InputGroupAddon>
					)}
					{valueAsNumber ? (
						<InputGroupInput
							{...inputProps}
							name={field.name}
							ref={field.ref}
							onBlur={field.onBlur}
							id={field.id}
							aria-invalid={field["aria-invalid"]}
							value={
								typeof field.value === "number" && !Number.isNaN(field.value)
									? field.value
									: ""
							}
							onChange={(e) => {
								const raw = e.target.value;
								field.onChange(
									raw === "" ? Number.NaN : e.target.valueAsNumber,
								);
							}}
						/>
					) : (
						<InputGroupInput {...field} {...inputProps} />
					)}
				</InputGroup>
			)}
		</FormBase>
	);
};
