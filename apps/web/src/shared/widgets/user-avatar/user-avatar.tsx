import type { User } from "@repo/api/types";
import type { VariantProps } from "class-variance-authority";
import { Link } from "react-router";
import { APP_ROUTES } from "@/app/routes";
import { Avatar, Text } from "@/shared/components";
import type { avatarVariants } from "@/shared/components/avatar/avatar.variants";
import {
	getUserFullName,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";

type UserAvatarProps = {
	user: User;
	size?: VariantProps<typeof avatarVariants>["size"];
	asLink?: boolean;
	showUserName?: boolean;
};

export const UserAvatar = ({
	user,
	asLink = false,
	size = "sm",
	showUserName = false,
}: UserAvatarProps) => {
	const Component = asLink ? Link : "div";

	return (
		<Component to={APP_ROUTES.settings} className="flex items-center gap-2">
			<Avatar user={user} size={size} />
			<div className="flex flex-col">
				{showUserName && hasUserName(user) && (
					<Text size="lg" weight="medium">
						{getUserFullName(user)}
					</Text>
				)}
				<Text size="sm" color="muted">
					{user.email}
				</Text>
			</div>
		</Component>
	);
};
