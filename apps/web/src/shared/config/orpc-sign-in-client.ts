import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { signInContractService } from "@repo/api/contracts";

const orpcUrl = import.meta.env.VITE_ORPC_URL ?? "http://localhost:3000/rpc";

const link = new RPCLink({
	url: orpcUrl,
});

export const signInOrpcClient: ContractRouterClient<
	typeof signInContractService
> = createORPCClient(link);
