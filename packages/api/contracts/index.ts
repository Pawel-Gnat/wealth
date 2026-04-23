import { populateContractRouterPaths } from '@orpc/contract'
import { signInContract } from './signin.contract'
import { signUpContract } from './signup.contract'

export const rpcContract = populateContractRouterPaths({
	user: {
		signIn: signInContract,
		signUp: signUpContract,
	},
})
