import type { ParseNsKeys } from "@repo/common";

type FormLineItemTitleLabelNsKey = Extract<
	ParseNsKeys<"form">,
	`form:line-item.${string}-label`
>;

/** Local `form` keys for line-item title labels, derived from {@link ParseNsKeys}. */
export type LineItemTitleLabelKey =
	FormLineItemTitleLabelNsKey extends `form:${infer Key}` ? Key : never;
