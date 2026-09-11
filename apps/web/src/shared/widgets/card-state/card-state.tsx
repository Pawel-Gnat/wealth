import type { ReactNode } from "react";
import {
	Card,
	type CardProps,
	Empty,
	ErrorState,
	type IconName,
	Skeleton,
} from "@/shared/components";

type CardStateBaseProps<T> = Omit<CardProps, "children"> & {
	data: T | null | undefined;
	children: (data: T) => ReactNode;
	isLoading?: boolean;
	isError: boolean;
	errorTitle: string;
	errorDescription: string;
	skeletonClassName?: string | undefined;
};

type CardStateEmptyProps = {
	inEditMode?: false;
	emptyTitle: string;
	emptyDescription: string;
	emptyIcon: IconName;
};

type CardStateEditProps = {
	inEditMode: true;
	emptyTitle?: never;
	emptyDescription?: never;
	emptyIcon?: never;
};

type CardStateProps<T> = CardStateBaseProps<T> &
	(CardStateEmptyProps | CardStateEditProps);

export const CardState = <T,>(props: CardStateProps<T>) => {
	const {
		data,
		children,
		title,
		subtitle,
		actions,
		className,
		contentClassName,
		skeletonClassName,
		isLoading,
		isError,
		errorTitle,
		errorDescription,
	} = props;

	if (isLoading) {
		return (
			<Card
				title={title}
				subtitle={subtitle}
				actions={actions}
				className={className}
			>
				<Skeleton className={skeletonClassName} />
			</Card>
		);
	}

	if (isError || data == null) {
		return (
			<Card title={title} subtitle={subtitle} className={className}>
				<ErrorState title={errorTitle} description={errorDescription} />
			</Card>
		);
	}

	if (props.inEditMode !== true && Array.isArray(data) && data.length === 0) {
		return (
			<Card
				title={title}
				subtitle={subtitle}
				actions={actions}
				className={className}
			>
				<Empty
					icon={props.emptyIcon}
					title={props.emptyTitle}
					description={props.emptyDescription}
				/>
			</Card>
		);
	}

	return (
		<Card
			title={title}
			subtitle={subtitle}
			actions={actions}
			className={className}
			contentClassName={contentClassName}
		>
			{children(data)}
		</Card>
	);
};
