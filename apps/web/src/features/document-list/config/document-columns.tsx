import type { DocumentListItem } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Link } from "react-router";
import { Button, Icon, Price, Text, Tooltip } from "@/shared/components";

type DocumentColumnsProps = {
	t: TFunction<"common">;
	language: string;
	getViewPath: (id: string) => string;
};

export const documentColumns = ({
	t,
	language,
	getViewPath,
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
				<Text size="sm" weight="medium" className="text-center">
					-
					<span className="sr-only">
						{t("common.actions", { ns: "common" })}
					</span>
				</Text>
			),
			cell: ({ row }) => {
				const previewText = t("action.preview", { ns: "common" });

				return (
					<div className="flex items-center gap-2 justify-end">
						<Tooltip
							trigger={
								<Button variant="secondary" asChild size="icon">
									<Link to={getViewPath(row.original.id)}>
										<Icon name="preview" />
										<span className="sr-only">{previewText}</span>
									</Link>
								</Button>
							}
							text={previewText}
						/>
					</div>
				);
			},
		},
	];
};
