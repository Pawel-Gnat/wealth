import type { ReactNode } from "react";
import {
	type Control,
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/shared/lib/ui/field";
import { FieldError } from "./field-error";

export type FormControlFunction<
	ExtraProps extends Record<string, unknown> = Record<never, never>,
> = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(
	props: FormInputProps<TFieldValues, TName, TTransformedValues> & ExtraProps,
) => ReactNode;

type FormFieldControlProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> = {
	name: TName;
	label: ReactNode;
	control: Control<TFieldValues, TName, TTransformedValues>;
};

type FormInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> = FormFieldControlProps<TFieldValues, TName, TTransformedValues> & {
	description?: ReactNode;
};

type FormBaseLayoutProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> = FormFieldControlProps<TFieldValues, TName, TTransformedValues> & {
	horizontal?: boolean;
	controlFirst?: boolean;
	children: (
		field: Parameters<
			ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
		>[0]["field"] & {
			"aria-invalid": boolean;
			id: string;
		},
	) => ReactNode;
};

type FormBaseProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> = FormBaseLayoutProps<TFieldValues, TName, TTransformedValues> &
	(
		| {
				srOnly: true;
				description?: never;
		  }
		| {
				srOnly?: false;
				description?: ReactNode;
		  }
	);

export const FormBase = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(
	props: FormBaseProps<TFieldValues, TName, TTransformedValues>,
) => {
	const {
		name,
		label,
		control,
		children,
		horizontal = false,
		controlFirst = false,
		srOnly = false,
	} = props;
	const description = srOnly ? undefined : props.description;

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => {
				const fieldControl = children({
					...field,
					id: field.name,
					"aria-invalid": fieldState.invalid,
				});

				const errorElement = fieldState.invalid && (
					<FieldError errors={[fieldState.error]} />
				);

				const labelElement = srOnly ? (
					<FieldLabel htmlFor={field.name} className="sr-only">
						{label}
					</FieldLabel>
				) : (
					<>
						<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
						{description && <FieldDescription>{description}</FieldDescription>}
					</>
				);

				return (
					<Field
						data-invalid={fieldState.invalid}
						orientation={horizontal ? "horizontal" : "vertical"}
					>
						{controlFirst ? (
							<>
								{fieldControl}
								<FieldContent>
									{!srOnly && labelElement}
									{errorElement}
								</FieldContent>
								{srOnly && labelElement}
							</>
						) : (
							<>
								{srOnly ? (
									labelElement
								) : (
									<FieldContent>{labelElement}</FieldContent>
								)}
								{fieldControl}
								{errorElement}
							</>
						)}
					</Field>
				);
			}}
		/>
	);
};
