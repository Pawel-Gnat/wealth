import type { DocumentCreatePayload } from "@repo/api/types";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	Badge,
	Button,
	FormInput,
	Icon,
	Price,
	Tooltip,
} from "@/shared/components";
import type { LineItemTitleLabelKey } from "../../model/line-item-title-label-key";

type DocumentLineItemProps = {
	index: number;
	form: UseFormReturn<DocumentCreatePayload>;
	remove: (index: number) => void;
	lineTotal: number;
	titleLabelKey: LineItemTitleLabelKey;
	readOnly?: boolean;
};

export const DocumentLineItem = ({
	index,
	form,
	remove,
	lineTotal,
	titleLabelKey,
	readOnly = false,
}: DocumentLineItemProps) => {
	const { t, i18n } = useTranslation();
	const deleteText = t("action.delete", { ns: "common" });

	return (
		<div className="flex flex-col gap-4 border-b pb-4 last:border-b-0 last:pb-0">
			<FormInput
				name={`lineItems.${index}.title`}
				label={t(titleLabelKey, { ns: "form" })}
				placeholder={t("line-item.placeholder", { ns: "form" })}
				control={form.control}
				readOnly={readOnly}
			/>

			<div className="flex flex-col sm:flex-row items-start gap-2">
				<FormInput
					name={`lineItems.${index}.singleAmount`}
					label={t("single-amount.label", { ns: "form" })}
					placeholder="0.01"
					type="number"
					step="0.01"
					valueAsNumber
					control={form.control}
					readOnly={readOnly}
				/>

				<FormInput
					name={`lineItems.${index}.quantity`}
					label={t("quantity.label", { ns: "form" })}
					placeholder="1"
					type="number"
					step="1"
					valueAsNumber
					control={form.control}
					readOnly={readOnly}
				/>

				<div className="flex shrink-0 flex-col gap-3 ml-auto">
					<div
						className="flex-col gap-1 leading-snug hidden sm:flex"
						aria-hidden
					>
						<span className="leading-snug">&nbsp;</span>
					</div>
					<div className="flex h-9 items-center gap-2">
						<Badge variant="neutral" className="h-auto">
							<Price
								size="sm"
								color="secondary"
								weight="medium"
								className="px-3 py-1.5"
								amount={lineTotal}
								language={i18n.language}
							/>
						</Badge>

						{!readOnly ? (
							<Tooltip
								trigger={
									<Button
										variant="destructive"
										size="icon"
										onClick={() => remove(index)}
									>
										<Icon name="delete" />
										<span className="sr-only">{deleteText}</span>
									</Button>
								}
								text={deleteText}
							/>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};
