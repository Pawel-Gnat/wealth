import { oc } from "@orpc/contract";
import {
	userEditPhotoResponseSchema,
	userEditPhotoSchema,
} from "../schemas/user.schema";

export const userEditPhotoContract = oc
	.route({ method: "PUT", path: "/settings/photo" })
	.input(userEditPhotoSchema)
	.output(userEditPhotoResponseSchema);
