import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Skeleton } from "@/shared/lib/ui/skeleton";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Table as TableUI,
} from "@/shared/lib/ui/table";
import { Empty } from "../empty";
import type { IconName } from "../icons";
import { Pagination } from "./pagination";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData, TValue> {
		className?: string;
	}
}

const SKELETON_ROW_COUNT = 10;
const SKELETON_ROW_KEYS = Array.from(
	{ length: SKELETON_ROW_COUNT },
	(_, i) => `skeleton-row-${i}`,
);

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading: boolean;
	noResultsTitle: string;
	noResultsDescription: string;
	noResultsIcon: IconName;
};

export const Table = <TData, TValue>({
	columns,
	data,
	isLoading,
	noResultsTitle,
	noResultsDescription,
	noResultsIcon,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-md border">
				<TableUI>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className={header.column.columnDef.meta?.className}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							SKELETON_ROW_KEYS.map((rowKey) => (
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
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cell.column.columnDef.meta?.className}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									<Empty
										title={noResultsTitle}
										description={noResultsDescription}
										icon={noResultsIcon}
									/>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</TableUI>
			</div>
			{!isLoading && data.length > 0 && <Pagination table={table} />}
		</div>
	);
};
