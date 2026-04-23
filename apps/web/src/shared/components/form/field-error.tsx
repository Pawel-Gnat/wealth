import { type ComponentProps, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {  TextError } from "../typography";

type FieldErrorProps = ComponentProps<"div"> & {
	errors?: Array<{ message?: string } | undefined>;
};

export function FieldError({
	className,
	children,
	errors,
	...props
}: FieldErrorProps) {
	const { t } = useTranslation();

	const content = useMemo(() => {
		if (children) {
			return children;
		}

		if (!errors?.length) {
			return null;
		}

		const uniqueErrors = [
			...new Map(errors.map((error) => [error?.message, error])).values(),
		];

		if (uniqueErrors.length === 1) {
			const msg = uniqueErrors[0]?.message;
			return msg ? <TextError size="xs">{String(t(msg as never))}</TextError> : null;
		}

		return (
			<ul className="ml-4 flex list-disc flex-col gap-1">
				{uniqueErrors.map((error) => {
					const msg = error?.message;
					return msg ? (
						<li key={msg}><TextError size="xs">{String(t(msg as never))}</TextError></li>
					) : null;
				})}
			</ul>
		);
	}, [children, errors, t]);

	if (!content) {
		return null;
	}

	return (
		<div
			role="alert"
			data-slot="field-error"
			className={ className}
			{...props}
		>
			{content}
		</div>
	);
}
