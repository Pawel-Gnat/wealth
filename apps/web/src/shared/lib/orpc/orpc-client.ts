import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { rpcContract } from "@repo/api/contracts";
import { orpcTransportFetch } from "@/shared/lib/orpc/orpc-transport";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

if (!baseUrl) {
	throw new Error("VITE_BACKEND_URL is not set");
}

const link = new OpenAPILink(rpcContract, {
	url: baseUrl,
	fetch: orpcTransportFetch,
});

export const orpcClient: ContractRouterClient<typeof rpcContract> =
	createORPCClient(link);
