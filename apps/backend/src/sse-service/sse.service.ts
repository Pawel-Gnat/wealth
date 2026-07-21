import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { SSE_HEARTBEAT_INTERVAL_MS } from "@repo/common/constants";
import type { Request, Response } from "express";
import { AuthService } from "../auth-service/auth.service.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";

@Injectable()
export class SseService {
	private readonly logger = new Logger(SseService.name);

	constructor(
		private readonly authService: AuthService,
		private readonly connectionRegistry: SseConnectionRegistry,
	) {}

	async connect(request: Request, response: Response) {
		const session = await this.authService.resolveActiveRefreshSession(request);
		if (!session) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		response.status(200);
		response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
		response.setHeader("Cache-Control", "no-cache, no-transform");
		response.setHeader("Connection", "keep-alive");
		response.setHeader("X-Accel-Buffering", "no");
		response.flushHeaders();

		const sink = {
			next: (data: unknown) => {
				this.writeData(response, data);
			},
			complete: () => {
				if (!response.writableEnded) {
					response.end();
				}
			},
		};

		const connection = await this.connectionRegistry.register({
			userId: session.userId,
			sessionId: session.sessionId,
			sink,
		});

		const heartbeat = setInterval(() => {
			this.writeComment(response, "ping");
		}, SSE_HEARTBEAT_INTERVAL_MS);

		let cleanedUp = false;
		const cleanup = async () => {
			if (cleanedUp) {
				return;
			}
			cleanedUp = true;
			clearInterval(heartbeat);
			await this.connectionRegistry.unregister(
				session.userId,
				connection.connectionId,
			);
		};

		request.on("close", () => {
			void cleanup();
		});
	}

	private writeComment(response: Response, comment: string) {
		if (response.writableEnded) {
			return;
		}

		try {
			response.write(`: ${comment}\n\n`);
		} catch (error) {
			this.logger.warn(
				`Failed to write SSE heartbeat: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	private writeData(response: Response, data: unknown) {
		if (response.writableEnded) {
			return;
		}

		const payload = typeof data === "string" ? data : JSON.stringify(data);

		try {
			response.write(`data: ${payload}\n\n`);
		} catch (error) {
			this.logger.warn(
				`Failed to write SSE data: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}
}
