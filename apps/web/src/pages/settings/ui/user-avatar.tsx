import type { User } from "@repo/api/types";
import { Avatar, Text } from "@/shared/components";
import { TextMuted } from "@/shared/components/typography/text";

type UserAvatarProps = {
	user: User;
};

export const UserAvatar = ({ user }: UserAvatarProps) => {
	return (
		<div className="flex items-center gap-4">
			<Avatar user={user} size="lg" />
			<div className="flex flex-col">
				{user.firstName && user.lastName && (
					<Text size="lg" weight="medium">
						{user.firstName} {user.lastName}
					</Text>
				)}
				<TextMuted size="sm">{user.email}</TextMuted>
			</div>
		</div>
	);
};
