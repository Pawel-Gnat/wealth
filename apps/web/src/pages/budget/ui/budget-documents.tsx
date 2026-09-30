import type { RecordListItem } from "@repo/api/types";
import {
	decodeDocumentDateFromStorage,
	formatDocumentDate,
} from "@repo/common/helpers";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Price, Separator, Text } from "@/shared/components";

type BudgetDocumentsProps = {
	documents: RecordListItem[];
};

export const BudgetDocuments = ({ documents }: BudgetDocumentsProps) => {
	const { t, i18n } = useTranslation();

	return (
		<div className="space-y-2">
			{documents.map((document, index) => (
				<Fragment key={document.id}>
					<div className="flex items-center justify-between gap-4 py-2">
						<div className="flex items-center gap-2">
							<Text size="sm">
								{formatDocumentDate(
									decodeDocumentDateFromStorage(document.date),
									i18n.language,
								)}
							</Text>
							<Badge
								variant={document.kind === "expense" ? "default" : "secondary"}
							>
								{t(
									document.kind === "expense"
										? "common.expenses"
										: "common.incomes",
									{ ns: "common" },
								)}
							</Badge>
						</div>
						<Price
							size="sm"
							weight="medium"
							amount={document.totalAmount}
							language={i18n.language}
						/>
					</div>

					{index !== documents.length - 1 && (
						<Separator orientation="horizontal" />
					)}
				</Fragment>
			))}
		</div>
	);
};
