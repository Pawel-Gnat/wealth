import type { User } from "@repo/api/types";
import type { VariantProps } from "class-variance-authority";
import { getUserFullName } from "@/shared/helpers/get-user-full-name";
import {
	AvatarFallback,
	AvatarImage,
	Avatar as AvatarUI,
} from "@/shared/lib/ui/avatar";
import { getInitials } from "../../helpers/initials";
import { avatarVariants } from "./config/avatar.config";

type AvatarProps = {
	user: User;
} & VariantProps<typeof avatarVariants>;

export const Avatar = ({ user, size }: AvatarProps) => {
	const fullName = getUserFullName(user);

	return (
		<AvatarUI className={avatarVariants({ size })}>
			{user.image && <AvatarImage src={user.image} alt={fullName} />}
			<AvatarFallback>{getInitials(fullName)}</AvatarFallback>
		</AvatarUI>
	);
};
