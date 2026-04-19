import { implement } from "@orpc/server";
import { signUpContractService } from "../contracts/signup.contract";

const os = implement(signUpContractService);

export const signUp = os.signUp.handler(async ({ input }) => {
	// TODO: return authService.signUp(input);
	void input.email;
	void input.password;
	void input.confirmPassword;

	return {
		data: {
			message: "user_created",
		},
	};
});

export const signUpRouter = os.router({
	signUp,
});
