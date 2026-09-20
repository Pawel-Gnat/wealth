import { oc } from "@orpc/contract";
import {
	storageGetParamsSchema,
	storageGetResponseSchema,
} from "../schemas/storage.schema";

export const storageGetContract = oc
	.route({ method: "GET", path: "/storage/{id}" })
	.input(storageGetParamsSchema)
	.output(storageGetResponseSchema);
