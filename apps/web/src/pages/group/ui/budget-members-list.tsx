import { cn } from "cn";

type BudgetMembersListProps = {
	children: React.ReactNode;
	className?: string;
};
export const BudgetMembersList = ({
	children,
	className,
}: BudgetMembersListProps) => {
	return (
		<ul
			className={cn("flex flex-col gap-4 bg-muted rounded-md p-4", className)}
		>
			{children}
		</ul>
	);
};
