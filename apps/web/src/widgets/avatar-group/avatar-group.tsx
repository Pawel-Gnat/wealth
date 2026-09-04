import { Avatar } from "@/shared/components";

type AvatarGroupProps = {
	avatars: string[];
};

export const AvatarGroup = ({ avatars }: AvatarGroupProps) => {
	return (
		<div className="flex items-center -space-x-[calc(--spacing(8)/3)] *:ring-2 *:ring-background *:transition-transform *:duration-200 *:ease-out *:hover:z-10 *:hover:-translate-y-1">
			{avatars.map((avatar) => (
				<Avatar key={avatar} src={avatar} name={avatar} />
			))}
		</div>
	);
};
