import type { User } from "@repo/api/types";
import { Avatar, Text } from "@/shared/components";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";

type UserAvatarProps = {
	user: User;
};

export const UserAvatar = ({ user }: UserAvatarProps) => {
	return (
		<div className="flex items-center gap-4">
			<Avatar user={user} size="lg" />
			<div className="flex flex-col">
				{hasUserName(user) && (
					<Text size="lg" weight="medium">
						{getUserFullName(user)}
					</Text>
				)}
				<Text size="sm" color="muted">
					{user.email}
				</Text>
			</div>
		</div>
	);
};
