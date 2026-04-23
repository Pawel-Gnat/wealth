import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { signInContractService } from "@repo/api/contracts";

const orpcUrl = import.meta.env.VITE_BACKEND_URL;

if (!orpcUrl) {
	throw new Error("VITE_BACKEND_URL is not set");
}

/**
 * Forwards `RequestInit` (including `signal` from the caller) to native `fetch`.
 * Central place to add timeouts, logging, or request wrapping later.
 */
function transportFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	return fetch(input, init);
}

const link = new RPCLink({
	url: orpcUrl,
	fetch: transportFetch,
});

export const signInOrpcClient: ContractRouterClient<
	typeof signInContractService
> = createORPCClient(link);
