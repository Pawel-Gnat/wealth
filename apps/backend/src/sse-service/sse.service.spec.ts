import { UnauthorizedException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../auth-service/auth.service.js";
import { SseService } from "./sse.service.js";
import { SseConnectionRegistry } from "./sse-connection-registry.service.js";

describe("SseService", () => {
	let moduleRef: TestingModule;
	let sseService: SseService;
	let resolveActiveRefreshSession: ReturnType<typeof vi.fn>;
	let register: ReturnType<typeof vi.fn>;
	let unregister: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		resolveActiveRefreshSession = vi.fn();
		register = vi.fn().mockResolvedValue({
			connectionId: "conn-1",
			userId: "user-1",
			sessionId: "session-1",
			sink: { next: vi.fn(), complete: vi.fn() },
		});
		unregister = vi.fn().mockResolvedValue(undefined);

		moduleRef = await Test.createTestingModule({
			providers: [
				SseService,
				{
					provide: AuthService,
					useValue: { resolveActiveRefreshSession },
				},
				{
					provide: SseConnectionRegistry,
					useValue: { register, unregister },
				},
			],
		}).compile();

		sseService = moduleRef.get(SseService);
	});

	afterEach(async () => {
		await moduleRef.close();
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	const createResponse = () => {
		const response = {
			status: vi.fn().mockReturnThis(),
			setHeader: vi.fn().mockReturnThis(),
			flushHeaders: vi.fn(),
			write: vi.fn(),
			end: vi.fn(),
			writableEnded: false,
		};
		return response as unknown as Response & {
			status: ReturnType<typeof vi.fn>;
			setHeader: ReturnType<typeof vi.fn>;
			flushHeaders: ReturnType<typeof vi.fn>;
			write: ReturnType<typeof vi.fn>;
			end: ReturnType<typeof vi.fn>;
		};
	};

	it("rejects when refresh cookie session is missing", async () => {
		resolveActiveRefreshSession.mockResolvedValue(null);
		const response = createResponse();

		await expect(sseService.connect({} as Request, response)).rejects.toThrow(
			UnauthorizedException,
		);
		expect(register).not.toHaveBeenCalled();
	});

	it("opens the stream, registers the connection, and heartbeats", async () => {
		vi.useFakeTimers();
		resolveActiveRefreshSession.mockResolvedValue({
			userId: "user-1",
			sessionId: "session-1",
		});

		const listeners = new Map<string, () => void>();
		const request = {
			on: vi.fn((event: string, handler: () => void) => {
				listeners.set(event, handler);
			}),
		} as unknown as Request;
		const response = createResponse();

		await sseService.connect(request, response);

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.setHeader).toHaveBeenCalledWith(
			"Content-Type",
			"text/event-stream; charset=utf-8",
		);
		expect(response.setHeader).toHaveBeenCalledWith(
			"Cache-Control",
			"no-cache, no-transform",
		);
		expect(response.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
		expect(response.setHeader).toHaveBeenCalledWith("X-Accel-Buffering", "no");
		expect(response.flushHeaders).toHaveBeenCalledOnce();
		expect(register).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "user-1",
				sessionId: "session-1",
				sink: expect.objectContaining({
					next: expect.any(Function),
					complete: expect.any(Function),
				}),
			}),
		);

		const registeredSink = register.mock.calls[0]?.[0]?.sink;
		registeredSink.next({ type: "auth.session-revoked" });
		expect(response.write).toHaveBeenCalledWith(
			'data: {"type":"auth.session-revoked"}\n\n',
		);

		await vi.advanceTimersByTimeAsync(20_000);
		expect(response.write).toHaveBeenCalledWith(": ping\n\n");

		listeners.get("close")?.();
		await vi.waitFor(() => {
			expect(unregister).toHaveBeenCalledWith("user-1", "conn-1");
		});
	});
});
