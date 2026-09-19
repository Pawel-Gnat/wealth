import { oc } from "@orpc/contract";
import {
	userEditDetailsResponseSchema,
	userEditDetailsSchema,
} from "../schemas/user.schema";

export const userEditDetailsContract = oc
	.route({ method: "PUT", path: "/settings/details" })
	.input(userEditDetailsSchema)
	.output(userEditDetailsResponseSchema);
