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
	const fullName = hasUserName(user) ? getUserFullName(user) : null;
	const primaryLabel = fullName ?? user.email;

	const content = (
		<>
			<Avatar user={user} size={size} />
			<div className="flex flex-col">
				<Text
					size={showUserName && fullName ? "lg" : "sm"}
					weight={showUserName && fullName ? "medium" : "normal"}
					color={showUserName && fullName ? "default" : "muted"}
				>
					{primaryLabel}
				</Text>
				{showUserName && fullName && (
					<Text size="sm" color="muted">
						{user.email}
					</Text>
				)}
			</div>
		</>
	);

	if (asLink) {
		return (
			<Link to={APP_ROUTES.settings} className="flex items-center gap-2">
				{content}
			</Link>
		);
	}

	return <div className="flex items-center gap-2">{content}</div>;
};
