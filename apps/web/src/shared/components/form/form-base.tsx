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
	FieldError,
	FieldLabel,
} from "@/shared/lib/ui/field";

export type FormControlFunction<
	ExtraProps extends Record<string, unknown> = Record<never, never>,
> = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>(
	props: FormInputProps<TFieldValues, TName, TTransformedValues> & ExtraProps,
) => ReactNode;

type FormInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> = {
	name: TName;
	label: ReactNode;
	description?: ReactNode;
	control: Control<TFieldValues, TName, TTransformedValues>;
};

type FormBaseProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> = FormInputProps<TFieldValues, TName, TTransformedValues> & {
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

export const FormBase = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	name,
	label,
	description,
	control,
	children,
	horizontal = false,
	controlFirst = false,
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => {
				const labelElement = (
					<>
						<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
						{description && <FieldDescription>{description}</FieldDescription>}
					</>
				);

				const control = children({
					...field,
					id: field.name,
					"aria-invalid": fieldState.invalid,
				});

				const errorElement = fieldState.invalid && (
					<FieldError errors={[fieldState.error]} />
				);

				return (
					<Field
						data-invalid={fieldState.invalid}
						orientation={horizontal ? "horizontal" : "vertical"}
					>
						{controlFirst ? (
							<>
								{control}
								<FieldContent>
									{labelElement}
									{errorElement}
								</FieldContent>
							</>
						) : (
							<>
								<FieldContent>{labelElement}</FieldContent>
								{control}
								{errorElement}
							</>
						)}
					</Field>
				);
			}}
		/>
	);
};
