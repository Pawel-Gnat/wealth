import type { User } from "@repo/api/types";
import type { VariantProps } from "class-variance-authority";
import {
	getUserFullName,
	getUserInitials,
	hasUserName,
} from "@/shared/helpers/get-user-full-name";
import { useGetUserAvatar } from "@/shared/hooks/use-get-user-avatar";
import {
	AvatarFallback,
	AvatarImage,
	Avatar as AvatarUI,
} from "@/shared/lib/ui/avatar";
import { avatarVariants } from "./config/avatar.config";

type AvatarProps = {
	user: User;
} & VariantProps<typeof avatarVariants>;

export const Avatar = ({ user, size }: AvatarProps) => {
	const fullName = hasUserName(user) ? getUserFullName(user) : user.email;
	const { url, isError } = useGetUserAvatar(user.image);
	console.log(url, isError);

	return (
		<AvatarUI className={avatarVariants({ size })}>
			{url && !isError && <AvatarImage src={url} alt={fullName} />}
			<AvatarFallback>{getUserInitials(user)}</AvatarFallback>
		</AvatarUI>
	);
};
