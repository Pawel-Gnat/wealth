import type { User } from "@repo/api/schemas";
import { Link } from "react-router";
import { Avatar, Text } from "@/shared/components";

type UserAvatarProps = {
	user: User;
};

export const UserAvatar = ({ user }: UserAvatarProps) => {
	const name =
		user.firstName && user.lastName
			? `${user.firstName} ${user.lastName}`
			: user.email;

	return (
		<Link to="/settings" className="flex items-center gap-2">
			<Avatar name={name} src={user.image} />
			<Text size="sm" weight="medium">
				{name}
			</Text>
		</Link>
	);
};
