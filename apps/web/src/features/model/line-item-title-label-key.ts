import type { ParseNsKeys } from "@repo/common/i18n";

type FormLineItemTitleLabelNsKey = Extract<
	ParseNsKeys<"form">,
	`form:line-item.${string}-label`
>;

export type LineItemTitleLabelKey =
	FormLineItemTitleLabelNsKey extends `form:${infer Key}` ? Key : never;
