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
import { Pagination } from "./pagination";

const SKELETON_ROW_COUNT = 10;

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading: boolean;
	noResultsText: string;
};

export const Table = <TData, TValue>({
	columns,
	data,
	isLoading,
	noResultsText,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const loadingColumns = table.getVisibleFlatColumns();

	return (
		<div className="flex flex-col gap-2">
			<div className="overflow-hidden rounded-md border">
				<TableUI>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
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
							Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton rows
								<TableRow key={`skeleton-${rowIndex}`}>
									{loadingColumns.map((column) => (
										<TableCell key={column.id}>
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
										<TableCell key={cell.id}>
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
									{noResultsText}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</TableUI>
			</div>
			{!isLoading && <Pagination table={table} />}
		</div>
	);
};
