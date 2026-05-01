import { Separator as SeparatorUI } from "@/shared/lib/ui/separator";

type SeparatorProps = React.ComponentProps<typeof SeparatorUI>;

export const Separator = ({
	orientation = "vertical",
	className,
	...props
}: SeparatorProps) => {
	return (
		<SeparatorUI orientation={orientation} className={className} {...props} />
	);
};
