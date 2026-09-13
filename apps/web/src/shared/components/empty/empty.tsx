import { Icon, type IconName } from "../icons";
import { Text } from "../typography";
import { TextMuted } from "../typography/text";

type EmptyProps = {
	icon: IconName;
	title: string;
	description: string;
};

export const Empty = ({ icon, title, description }: EmptyProps) => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 my-2">
			<Icon name={icon} className="bg-muted size-12 p-3 rounded-full" />
			<Text weight="medium">{title}</Text>
			<TextMuted size="sm">{description}</TextMuted>
		</div>
	);
};
