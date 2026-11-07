import { Icon, type IconName } from "../icons";
import { Text } from "../typography";

type EmptyProps = {
	icon: IconName;
	title: string;
	description: string;
};

export const Empty = ({ icon, title, description }: EmptyProps) => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 my-2 text-center p-2">
			<Icon name={icon} variant="status" color="muted" />
			<Text weight="medium">{title}</Text>
			<Text size="sm" color="muted">
				{description}
			</Text>
		</div>
	);
};
