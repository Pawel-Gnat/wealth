import type { DocumentDetails } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import {
	calculateDocumentTotal,
	calculateLineTotal,
} from "@/features/document-form/helpers/document-totals";
import { Price, Text } from "@/shared/components";

type DocumentViewProps = {
	document: DocumentDetails;
};

export const DocumentView = ({ document }: DocumentViewProps) => {
	const { t, i18n } = useTranslation();
	const totalAmount = calculateDocumentTotal(document.lineItems);

	return (
		<div className="flex flex-col">
			<div className="flex items-center gap-4 border-b border-border py-2">
				<Text size="sm" weight="medium" color="muted" className="flex-1">
					{t("common.item", { ns: "common" })}
				</Text>
				<Text size="sm" weight="medium" color="muted">
					{t("common.amount", { ns: "common" })}
				</Text>
			</div>

			{document.lineItems.map((item) => {
				const lineTotal = calculateLineTotal(item.singleAmount, item.quantity);

				return (
					<div
						key={item.id}
						className="flex items-center gap-4 border-b border-border py-3.5 last:border-b-0"
					>
						<div className="flex flex-1 flex-col gap-1">
							<Text size="sm" weight="medium">
								{item.title}
							</Text>
							<Text size="sm" color="muted">
								<Price
									as="span"
									size="sm"
									amount={item.singleAmount}
									language={i18n.language}
								/>{" "}
								x {item.quantity}
							</Text>
						</div>
						<Price
							size="sm"
							weight="medium"
							amount={lineTotal}
							language={i18n.language}
						/>
					</div>
				);
			})}

			<div className="flex items-center justify-between pt-3">
				<Text size="sm" color="muted">
					{t("common.total", { ns: "common" })}
				</Text>
				<Price
					size="lg"
					weight="bold"
					amount={totalAmount}
					language={i18n.language}
				/>
			</div>
		</div>
	);
};
