import { oc } from "@orpc/contract";
import {
	signUpPayloadSchema,
	signUpResponseSchema,
} from "../schemas/signup.schema";

const signUpContract = oc
	.input(signUpPayloadSchema)
	.output(signUpResponseSchema);

export const signUpContractService = {
	signUp: signUpContract,
};
