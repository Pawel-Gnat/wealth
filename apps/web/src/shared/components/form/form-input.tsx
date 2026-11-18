import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/shared/lib/ui/input-group";
import { Icon, type IconName } from "../icons";
import { FormBase, type FormControlFunction } from "./form-base";
import { usePasswordVisibility } from "./hooks/use-password-visibility";

type FormInputNativeProps = Omit<
	ComponentProps<"input">,
	"name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
> & {
	valueAsNumber?: boolean;
	icon?: IconName;
};

export const FormInput: FormControlFunction<FormInputNativeProps> = (props) => {
	const { t } = useTranslation();

	const {
		name,
		label,
		description,
		control,
		valueAsNumber,
		icon,
		type,
		disabled,
		...inputProps
	} = props;

	const { isPassword, isRevealed, inputType, toggle } =
		usePasswordVisibility(type);

	const visibilityLabel = t(isRevealed ? "password.hide" : "password.show", {
		ns: "form",
	});

	const passwordToggleLabel =
		typeof label === "string"
			? `${visibilityLabel}, ${label}`
			: visibilityLabel;

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
							type={inputType}
							spellCheck={isPassword ? false : undefined}
							disabled={disabled || field.disabled}
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
						<InputGroupInput
							{...field}
							{...inputProps}
							type={inputType}
							spellCheck={isPassword ? false : undefined}
							disabled={disabled || field.disabled}
						/>
					)}

					{isPassword && (
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								size="icon-xs"
								variant="ghost"
								aria-label={passwordToggleLabel}
								aria-pressed={isRevealed}
								disabled={disabled || field.disabled}
								onMouseDown={(event) => {
									event.preventDefault();
								}}
								onClick={toggle}
							>
								<Icon name={isRevealed ? "eyeOff" : "eye"} />
							</InputGroupButton>
						</InputGroupAddon>
					)}
				</InputGroup>
			)}
		</FormBase>
	);
};
