import type { DocumentListItem } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Link } from "react-router";
import {
	ButtonDestructive,
	ButtonSecondary,
	Icon,
	Price,
	Text,
	Tooltip,
} from "@/shared/components";

type DocumentColumnsProps = {
	t: TFunction<"common">;
	language: string;
	getEditPath: (id: string) => string;
	onDelete: (documentId: string) => void;
};

export const documentColumns = ({
	t,
	language,
	getEditPath,
	onDelete,
}: DocumentColumnsProps): ColumnDef<DocumentListItem>[] => {
	return [
		{
			accessorKey: "date",
			meta: { className: "w-full" },
			header: () => (
				<Text size="sm" weight="medium">
					{t("common.date", { ns: "common" })}
				</Text>
			),
			cell: ({ row }) => {
				return (
					<Text size="sm">
						{formatDocumentDate(
							decodeDocumentDateFromStorage(row.original.date),
							language,
						)}
					</Text>
				);
			},
		},
		{
			accessorKey: "totalAmount",
			meta: { className: "w-[1%] whitespace-nowrap" },
			header: () => (
				<Text size="sm" weight="medium">
					{t("common.amount", { ns: "common" })}
				</Text>
			),
			cell: ({ row }) => {
				const amount = row.getValue<number>("totalAmount");
				return (
					<Price
						size="sm"
						weight="medium"
						amount={amount}
						language={language}
					/>
				);
			},
		},
		{
			accessorKey: "actions",
			meta: { className: "w-[1%] whitespace-nowrap" },
			header: () => (
				<Text size="sm" weight="medium" className="text-right">
					-
					<span className="sr-only">
						{t("common.actions", { ns: "common" })}
					</span>
				</Text>
			),
			cell: ({ row }) => {
				const editText = t("action.edit", { ns: "common" });
				const deleteText = t("action.delete", { ns: "common" });

				return (
					<div className="flex items-center gap-2 justify-end">
						<Tooltip
							trigger={
								<ButtonSecondary asChild size="icon">
									<Link to={getEditPath(row.original.id)}>
										<Icon name="edit" />
										<span className="sr-only">{editText}</span>
									</Link>
								</ButtonSecondary>
							}
							text={editText}
						/>
						<Tooltip
							trigger={
								<ButtonDestructive
									size="icon"
									onClick={() => onDelete(row.original.id)}
								>
									<Icon name="delete" />
									<span className="sr-only">{deleteText}</span>
								</ButtonDestructive>
							}
							text={deleteText}
						/>
					</div>
				);
			},
		},
	];
};
