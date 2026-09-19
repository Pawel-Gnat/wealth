import type { User } from "@repo/api/types";
import { Avatar, Tooltip } from "@/shared/components";

type AvatarGroupProps = {
	users: User[];
};

export const AvatarGroup = ({ users }: AvatarGroupProps) => {
	return (
		<div className="flex items-center -space-x-[calc(--spacing(8)/3)]">
			{users.map((user) => (
				<Tooltip
					key={user.id}
					trigger={
						<div className="rounded-full transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:**:data-[slot=avatar]:ring-2 hover:**:data-[slot=avatar]:ring-background">
							<Avatar user={user} />
						</div>
					}
					text={user.email}
				/>
			))}
		</div>
	);
};
