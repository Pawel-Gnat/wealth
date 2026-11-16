import { type ReactNode, useEffect } from "react";
import {
	type Control,
	type DefaultValues,
	type FieldPath,
	type FieldValues,
	useForm,
} from "react-hook-form";

type FormFieldStoryProps<TFieldValues extends FieldValues> = {
	children: (control: Control<TFieldValues>) => ReactNode;
	defaultValues?: DefaultValues<TFieldValues>;
	disabled?: boolean;
	error?: {
		name: FieldPath<TFieldValues>;
		message: string;
	};
};

export const FormFieldStory = <TFieldValues extends FieldValues>({
	children,
	defaultValues,
	disabled,
	error,
}: FormFieldStoryProps<TFieldValues>) => {
	const form = useForm<TFieldValues>({
		...(defaultValues === undefined ? {} : { defaultValues }),
		...(disabled ? { disabled: true } : {}),
	});
	const errorName = error?.name;
	const errorMessage = error?.message;

	useEffect(() => {
		if (errorName === undefined || errorMessage === undefined) {
			return;
		}

		form.setError(errorName, { message: errorMessage });
	}, [errorMessage, errorName, form]);

	return children(form.control);
};
