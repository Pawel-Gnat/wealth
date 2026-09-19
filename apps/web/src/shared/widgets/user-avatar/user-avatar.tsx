import type { User } from "@repo/api/types";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Avatar, Text } from "@/shared/components";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";

type UserAvatarProps = {
	user: User;
};

export const UserAvatar = ({ user }: UserAvatarProps) => {
	const fullName = hasUserName(user) ? getUserFullName(user) : user.email;

	return (
		<Link to={APP_ROUTES.settings} className="flex items-center gap-2">
			<Avatar user={user} />
			<Text size="sm" weight="medium">
				{fullName}
			</Text>
		</Link>
	);
};
