import { oc } from "@orpc/contract";
import {
	userEditAvatarResponseSchema,
	userEditAvatarSchema,
} from "../schemas/user.schema";

export const userEditAvatarContract = oc
	.route({ method: "PUT", path: "/settings/avatar" })
	.input(userEditAvatarSchema)
	.output(userEditAvatarResponseSchema);
