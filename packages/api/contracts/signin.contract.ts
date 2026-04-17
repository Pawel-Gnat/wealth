import { oc } from "@orpc/contract";
import {
	signInPayloadSchema,
	tokenResponseSchema,
} from "@/schemas/signin.schema";

const signInContract = oc
	.input(signInPayloadSchema)
	.output(tokenResponseSchema);

export const signInContractService = {
	signIn: signInContract,
};
