import type { Table } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/shared/lib/ui/table";
import { Skeleton } from "../skeleton";

const SKELETON_ROW_COUNT = 10;
const SKELETON_ROW_KEYS = Array.from(
	{ length: SKELETON_ROW_COUNT },
	(_, i) => `skeleton-row-${i}`,
);

type DataTableSkeletonBodyProps<TData> = {
	table: Table<TData>;
};

export const DataTableSkeletonBody = <TData,>({
	table,
}: DataTableSkeletonBodyProps<TData>) => {
	return SKELETON_ROW_KEYS.map((rowKey) => (
		<TableRow key={rowKey}>
			{table.getVisibleFlatColumns().map((column) => (
				<TableCell
					key={`${rowKey}-${column.id}`}
					className={column.columnDef.meta?.className}
				>
					<Skeleton className="h-4 w-full max-w-48" />
				</TableCell>
			))}
		</TableRow>
	));
};
