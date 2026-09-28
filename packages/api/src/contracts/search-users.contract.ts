import { oc } from "@orpc/contract";
import {
	userSearchParamsSchema,
	userSearchResponseSchema,
} from "../schemas/user.schema";

export const searchUsersContract = oc
	.route({ method: "GET", path: "/users/search" })
	.input(userSearchParamsSchema)
	.output(userSearchResponseSchema);
