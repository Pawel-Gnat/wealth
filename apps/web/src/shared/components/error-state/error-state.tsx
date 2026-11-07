import { Icon } from "../icons";
import { Text } from "../typography";

type ErrorStateProps = {
	title: string;
	description: string;
};

export const ErrorState = ({ title, description }: ErrorStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 my-2 p-2">
			<Icon name="error" variant="status" color="destructive" />
			<Text color="destructive" weight="medium">
				{title}
			</Text>
			<Text size="sm" color="muted">
				{description}
			</Text>
		</div>
	);
};
