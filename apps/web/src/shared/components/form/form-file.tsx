import {
	USER_PHOTO_MAX_SIZE_BYTES,
	USER_PHOTO_MIME_TYPES,
} from "@repo/api/schemas";
import { cn } from "cn";
import type { ReactNode } from "react";
import { type DropzoneOptions, useDropzone } from "react-dropzone";
import { Icon } from "../icons";
import { FormBase, type FormControlFunction } from "./form-base";

type FormFileDropzoneProps = {
	name: string;
	id: string;
	value: unknown;
	onChange: (value: File | null) => void;
	onBlur: () => void;
	setInputRef: (instance: HTMLInputElement | null) => void;
	"aria-invalid": boolean;
	label: ReactNode;
	description: ReactNode;
	accept: NonNullable<DropzoneOptions["accept"]>;
	maxSize: number;
	disabled: boolean;
};

const FormFileDropzone = ({
	name,
	id,
	value,
	onChange,
	onBlur,
	setInputRef,
	label,
	description,
	accept,
	maxSize,
	disabled,
	"aria-invalid": isInvalid,
}: FormFileDropzoneProps) => {
	const { getRootProps, getInputProps, inputRef, isDragActive } = useDropzone({
		accept,
		maxSize,
		multiple: false,
		disabled,
		onDrop: (acceptedFiles) => {
			if (acceptedFiles[0]) {
				onChange(acceptedFiles[0]);
			}
		},
	});

	const selectedFile = value instanceof File ? value : null;

	return (
		<div
			{...getRootProps({
				className: cn(
					"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-border bg-muted p-5",
					isDragActive && "border-foreground",
					isInvalid && "border-destructive",
					disabled && "pointer-events-none opacity-50",
				),
			})}
		>
			<input
				{...getInputProps({
					id,
					name,
					onBlur,
				})}
				aria-invalid={isInvalid}
				ref={(element) => {
					setInputRef(element);
					if (element) {
						inputRef.current = element;
					}
				}}
			/>
			<Icon name="upload" size={24} className="text-muted-foreground" />
			<span className="text-sm font-medium">{label}</span>
			{(description || selectedFile) && (
				<span className="text-xs text-muted-foreground">
					{selectedFile ? selectedFile.name : description}
				</span>
			)}
		</div>
	);
};

export const FormFile: FormControlFunction<{
	accept?: DropzoneOptions["accept"];
	maxSize?: number;
	disabled?: boolean;
}> = ({ name, label, description, control, accept, maxSize, disabled }) => {
	return (
		<FormBase
			name={name}
			label={<span className="sr-only">{label}</span>}
			control={control}
		>
			{(field) => (
				<FormFileDropzone
					name={field.name}
					id={field.id}
					value={field.value}
					onChange={(file) => field.onChange(file)}
					onBlur={field.onBlur}
					setInputRef={field.ref}
					aria-invalid={field["aria-invalid"]}
					label={label}
					description={description ?? null}
					accept={
						accept ??
						Object.fromEntries(USER_PHOTO_MIME_TYPES.map((mime) => [mime, []]))
					}
					maxSize={maxSize ?? USER_PHOTO_MAX_SIZE_BYTES}
					disabled={disabled ?? false}
				/>
			)}
		</FormBase>
	);
};
