import { Badge, Text } from "@/shared/components";
import { AvatarGroup } from "@/widgets/avatar-group";

type BudgetProps = {
	title: string;
	assignment: string;
	users: string[];
};

export const Budget = ({ title, assignment, users }: BudgetProps) => {
	return (
		<div>
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Text size="lg" weight="bold">
						{title}
					</Text>
					<Badge>{assignment}</Badge>
				</div>
				<AvatarGroup avatars={users} />
			</div>
		</div>
	);
};
