import { oc } from "@orpc/contract";
import {
	documentCreateInputSchema,
	documentCreateResponseSchema,
	documentDeleteResponseSchema,
	documentDetailsResponseSchema,
	documentListParamsSchema,
	documentListResponseSchema,
	documentParamsSchema,
	documentUpdateInputSchema,
	documentUpdateResponseSchema,
} from "../schemas/document.schema";

export const listDocumentsContract = oc
	.route({ method: "GET", path: "/documents" })
	.input(documentListParamsSchema)
	.output(documentListResponseSchema);

export const createDocumentContract = oc
	.route({ method: "POST", path: "/documents" })
	.input(documentCreateInputSchema)
	.output(documentCreateResponseSchema);

export const getDocumentContract = oc
	.route({ method: "GET", path: "/documents/{id}" })
	.input(documentParamsSchema)
	.output(documentDetailsResponseSchema);

export const updateDocumentContract = oc
	.route({ method: "PUT", path: "/documents/{id}" })
	.input(documentUpdateInputSchema)
	.output(documentUpdateResponseSchema);

export const deleteDocumentContract = oc
	.route({ method: "DELETE", path: "/documents/{id}" })
	.input(documentParamsSchema)
	.output(documentDeleteResponseSchema);
