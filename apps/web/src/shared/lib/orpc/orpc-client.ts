import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { rpcContract } from "@repo/api/contracts";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

if (!baseUrl) {
	throw new Error("VITE_BACKEND_URL is not set");
}

function transportFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	return fetch(input, init);
}

const link = new OpenAPILink(rpcContract, {
	url: baseUrl,
	fetch: transportFetch,
});

export const orpcClient: ContractRouterClient<typeof rpcContract> =
	createORPCClient(link);
