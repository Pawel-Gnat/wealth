import { implement } from "@orpc/server";
import { signInContractService } from "../contracts/signin.contract";

const os = implement(signInContractService);

export const signIn = os.signIn.handler(async ({ input }) => {
	// TODO: return authService.signIn(input);
	void input.email;
	void input.password;

	return {
		data: {
			token: "stub-token",
		},
	};
});

export const signInRouter = os.router({
	signIn,
});
