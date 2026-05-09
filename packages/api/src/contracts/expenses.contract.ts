import { oc } from "@orpc/contract";
import {
	documentCreateResponseSchema,
	documentDeletePayloadSchema,
	documentDeleteResponseSchema,
	documentDetailsResponseSchema,
	documentGetPayloadSchema,
	documentListResponseSchema,
	documentUpdateResponseSchema,
	documentUpsertPayloadSchema,
} from "../schemas/document.schema";

export const listExpensesContract = oc
	.route({ method: "GET", path: "/expenses" })
	.output(documentListResponseSchema);

export const createExpenseContract = oc
	.route({ method: "POST", path: "/expenses" })
	.input(documentUpsertPayloadSchema)
	.output(documentCreateResponseSchema);

export const getExpenseContract = oc
	.route({ method: "GET", path: "/expenses/{id}" })
	.input(documentGetPayloadSchema)
	.output(documentDetailsResponseSchema);

export const updateExpenseContract = oc
	.route({ method: "PUT", path: "/expenses/{id}" })
	.input(documentUpsertPayloadSchema)
	.output(documentUpdateResponseSchema);

export const deleteExpenseContract = oc
	.route({ method: "DELETE", path: "/expenses" })
	.input(documentDeletePayloadSchema)
	.output(documentDeleteResponseSchema);
