import type { User } from "@repo/api/schemas";
import { Avatar, Tooltip } from "@/shared/components";

type AvatarGroupProps = {
	users: User[];
};

export const AvatarGroup = ({ users }: AvatarGroupProps) => {
	return (
		<div className="flex items-center -space-x-[calc(--spacing(8)/3)] *:ring-2 *:ring-background *:transition-transform *:duration-200 *:ease-out *:hover:z-10 *:hover:-translate-y-1">
			{users.map((user) => (
				<Tooltip
					key={user.id}
					trigger={
						<div>
							<Avatar name={user.email} src={user.image} />
						</div>
					}
					text={user.email}
				/>
			))}
		</div>
	);
};
