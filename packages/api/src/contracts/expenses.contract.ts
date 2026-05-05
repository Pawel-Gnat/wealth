import { oc } from "@orpc/contract";
import {
	documentCreatePayloadSchema,
	documentCreateResponseSchema,
	expenseDocumentListResponseSchema,
} from "../schemas/document.schema";

export const listExpensesContract = oc
	.route({ method: "GET", path: "/expenses" })
	.output(expenseDocumentListResponseSchema);

export const createExpenseContract = oc
	.route({ method: "POST", path: "/expenses" })
	.input(documentCreatePayloadSchema)
	.output(documentCreateResponseSchema);
