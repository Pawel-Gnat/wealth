import { Injectable } from "@nestjs/common";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { appRouter } from "./app.router";

@Injectable()
export class OrpcService {
	readonly handler = new RPCHandler(appRouter, {
		interceptors: [
			onError((error: unknown) => {
				console.error("[oRPC]", error);
			}),
		],
	});
}
