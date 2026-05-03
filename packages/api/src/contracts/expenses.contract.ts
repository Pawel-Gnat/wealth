import { oc } from "@orpc/contract";
import { expenseDocumentListResponseSchema } from "../schemas/document.schema";

export const listExpensesContract = oc
	.route({ method: "GET", path: "/expenses" })
	.output(expenseDocumentListResponseSchema);
