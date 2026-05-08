import { oc } from "@orpc/contract";
import {
	documentCreatePayloadSchema,
	documentCreateResponseSchema,
	documentDeletePayloadSchema,
	documentDeleteResponseSchema,
	documentUpdatePayloadSchema,
	documentUpdateResponseSchema,
	expenseDocumentListResponseSchema,
} from "../schemas/document.schema";

export const listExpensesContract = oc
	.route({ method: "GET", path: "/expenses" })
	.output(expenseDocumentListResponseSchema);

export const createExpenseContract = oc
	.route({ method: "POST", path: "/expenses" })
	.input(documentCreatePayloadSchema)
	.output(documentCreateResponseSchema);

export const updateExpenseContract = oc
	.route({ method: "PUT", path: "/expenses/{id}" })
	.input(documentUpdatePayloadSchema)
	.output(documentUpdateResponseSchema);

export const deleteExpenseContract = oc
	.route({ method: "DELETE", path: "/expenses" })
	.input(documentDeletePayloadSchema)
	.output(documentDeleteResponseSchema);
