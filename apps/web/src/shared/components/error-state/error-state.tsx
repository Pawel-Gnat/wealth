import { Icon } from "../icons";
import { Text } from "../typography";

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
			<Text color="destructive" weight="medium">
				{title}
			</Text>
			<Text size="sm" color="muted">
				{description}
			</Text>
		</div>
	);
};
