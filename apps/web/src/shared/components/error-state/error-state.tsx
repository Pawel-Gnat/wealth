import { Icon } from "../icons";
import { TextError } from "../typography";
import { TextMuted } from "../typography/text";

type ErrorStateProps = {
	title: string;
	description: string;
};

export const ErrorState = ({ title, description }: ErrorStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 my-2">
			<Icon
				name="error"
				className="bg-destructive text-destructive-foreground size-12 p-3 rounded-full"
			/>
			<TextError weight="medium">{title}</TextError>
			<TextMuted size="sm">{description}</TextMuted>
		</div>
	);
};
