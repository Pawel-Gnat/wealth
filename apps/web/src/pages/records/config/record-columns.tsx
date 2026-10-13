import type { RecordListItem } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Link } from "react-router";
import {
	Avatar,
	Badge,
	Button,
	Icon,
	Price,
	Text,
	Tooltip,
} from "@/shared/components";

type RecordColumnsProps = {
	t: TFunction<"common">;
	language: string;
	getViewPath: (id: string) => string;
	showOwner: boolean;
};

export const recordColumns = ({
	t,
	language,
	getViewPath,
	showOwner,
}: RecordColumnsProps): ColumnDef<RecordListItem>[] => {
	return [
		...(showOwner
			? [
					{
						accessorKey: "owner",
						meta: { className: "w-[1%] whitespace-nowrap" },
						header: () => (
							<Text size="sm" weight="medium">
								{t("list.owner", { ns: "records" })}
							</Text>
						),
						cell: ({ row }) => {
							const owner = row.original.owner;

							if (!owner) {
								return null;
							}

							return (
								<Tooltip
									trigger={
										<div className="inline-flex">
											<Avatar user={owner} size="sm" />
										</div>
									}
									text={owner.email}
								/>
							);
						},
					} satisfies ColumnDef<RecordListItem>,
				]
			: []),
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
			accessorKey: "kind",
			meta: { className: "w-[1%] whitespace-nowrap" },
			header: () => (
				<Text size="sm" weight="medium">
					{t("list.type", { ns: "records" })}
				</Text>
			),
			cell: ({ row }) => {
				const kind = row.original.kind;

				return (
					<Badge variant={kind === "expense" ? "default" : "secondary"}>
						{kind}
					</Badge>
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
