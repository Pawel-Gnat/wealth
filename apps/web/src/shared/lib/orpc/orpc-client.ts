import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { rpcContract } from "@repo/api/contracts";
import { reportClientError } from "@/shared/helpers/controlled-fetch";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

if (!baseUrl) {
	throw new Error("VITE_BACKEND_URL is not set");
}

async function orpcTransportFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	try {
		return await fetch(input, init);
	} catch (error) {
		reportClientError(error);
		throw error;
	}
}

const link = new OpenAPILink(rpcContract, {
	url: baseUrl,
	fetch: orpcTransportFetch,
});

export const orpcClient: ContractRouterClient<typeof rpcContract> =
	createORPCClient(link);
