import { TableCell, TableRow } from "@/shared/lib/ui/table";
import { Empty } from "../empty";
import type { IconName } from "../icons";

type DataTableEmptyProps = {
	colSpan: number;
	title: string;
	description: string;
	icon: IconName;
};

export const DataTableEmpty = ({
	colSpan,
	title,
	description,
	icon,
}: DataTableEmptyProps) => {
	return (
		<TableRow>
			<TableCell colSpan={colSpan} className="h-24 text-center">
				<Empty title={title} description={description} icon={icon} />
			</TableCell>
		</TableRow>
	);
};
