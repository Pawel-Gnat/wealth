import { oc } from "@orpc/contract";
import {
	documentCreatePayloadSchema,
	documentDetailsResponseSchema,
	documentGetPayloadSchema,
	documentListResponseSchema,
	documentUpdatePayloadSchema,
	incomeDocumentCreateResponseSchema,
	incomeDocumentDeleteResponseSchema,
	incomeDocumentUpdateResponseSchema,
} from "../schemas/document.schema";

export const listIncomesContract = oc
	.route({ method: "GET", path: "/incomes" })
	.output(documentListResponseSchema);

export const createIncomeContract = oc
	.route({ method: "POST", path: "/incomes" })
	.input(documentCreatePayloadSchema)
	.output(incomeDocumentCreateResponseSchema);

export const getIncomeContract = oc
	.route({ method: "GET", path: "/incomes/{id}" })
	.input(documentGetPayloadSchema)
	.output(documentDetailsResponseSchema);

export const updateIncomeContract = oc
	.route({ method: "PUT", path: "/incomes/{id}" })
	.input(documentUpdatePayloadSchema)
	.output(incomeDocumentUpdateResponseSchema);

export const deleteIncomeContract = oc
	.route({ method: "DELETE", path: "/incomes/{id}" })
	.input(documentGetPayloadSchema)
	.output(incomeDocumentDeleteResponseSchema);
