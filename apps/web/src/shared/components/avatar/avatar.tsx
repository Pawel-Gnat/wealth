import {
	AvatarFallback,
	AvatarImage,
	Avatar as AvatarUI,
} from "@/shared/lib/ui/avatar";
import { getInitials } from "./helpers/initials";

type AvatarProps = {
	src: string | undefined;
	name: string;
};

export const Avatar = ({ src, name }: AvatarProps) => {
	return (
		<AvatarUI>
			{src && <AvatarImage src={src} alt={name} className="grayscale" />}
			<AvatarFallback>{getInitials(name)}</AvatarFallback>
		</AvatarUI>
	);
};
