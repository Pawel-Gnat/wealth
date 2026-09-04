import {
	AvatarFallback,
	AvatarImage,
	Avatar as AvatarUI,
} from "@/shared/lib/ui/avatar";
import { getInitials } from "./helpers/initials";

type AvatarProps = {
	src: string;
	name: string;
};

export const Avatar = ({ src, name }: AvatarProps) => {
	return (
		<AvatarUI>
			<AvatarImage src={src} alt={name} className="grayscale" />
			<AvatarFallback>{getInitials(name)}</AvatarFallback>
		</AvatarUI>
	);
};
