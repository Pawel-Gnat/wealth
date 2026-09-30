import { oc } from "@orpc/contract";
import {
	recordCreateInputSchema,
	recordCreateResponseSchema,
	recordDeleteResponseSchema,
	recordDetailsResponseSchema,
	recordGetParamsSchema,
	recordListParamsSchema,
	recordListResponseSchema,
	recordParamsSchema,
	recordUpdateInputSchema,
	recordUpdateResponseSchema,
} from "../schemas/record.schema";

export const listRecordsContract = oc
	.route({ method: "GET", path: "/records" })
	.input(recordListParamsSchema)
	.output(recordListResponseSchema);

export const createRecordContract = oc
	.route({ method: "POST", path: "/records" })
	.input(recordCreateInputSchema)
	.output(recordCreateResponseSchema);

export const getRecordContract = oc
	.route({ method: "GET", path: "/records/{id}" })
	.input(recordGetParamsSchema)
	.output(recordDetailsResponseSchema);

export const updateRecordContract = oc
	.route({ method: "PUT", path: "/records/{id}" })
	.input(recordUpdateInputSchema)
	.output(recordUpdateResponseSchema);

export const deleteRecordContract = oc
	.route({ method: "DELETE", path: "/records/{id}" })
	.input(recordParamsSchema)
	.output(recordDeleteResponseSchema);
