import { cn } from "cn";

type BudgetMembersProps = {
	children: React.ReactNode;
	className?: string;
};
export const BudgetMembers = ({ children, className }: BudgetMembersProps) => {
	return (
		<div
			className={cn("flex flex-col gap-4 bg-muted rounded-md p-4", className)}
		>
			{children}
		</div>
	);
};
