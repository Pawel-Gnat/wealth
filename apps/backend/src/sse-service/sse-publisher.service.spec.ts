import { Test, type TestingModule } from "@nestjs/testing";
import type { SseEvent } from "@repo/api/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SseConnectionRegistry } from "./sse-connection-registry.service";
import { SsePublisher } from "./sse-publisher.service";

describe("SsePublisher", () => {
	let moduleRef: TestingModule;
	let publisher: SsePublisher;
	let getConnections: ReturnType<typeof vi.fn>;
	let unregister: ReturnType<typeof vi.fn>;
	let nextA: ReturnType<typeof vi.fn>;
	let completeA: ReturnType<typeof vi.fn>;
	let nextB: ReturnType<typeof vi.fn>;
	let completeB: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		nextA = vi.fn();
		completeA = vi.fn();
		nextB = vi.fn();
		completeB = vi.fn();
		getConnections = vi.fn().mockReturnValue([
			{
				connectionId: "conn-a",
				userId: "user-1",
				sessionId: "session-a",
				sink: { next: nextA, complete: completeA },
			},
			{
				connectionId: "conn-b",
				userId: "user-1",
				sessionId: "session-b",
				sink: { next: nextB, complete: completeB },
			},
		]);
		unregister = vi.fn();

		moduleRef = await Test.createTestingModule({
			providers: [
				SsePublisher,
				{
					provide: SseConnectionRegistry,
					useValue: { getConnections, unregister },
				},
			],
		}).compile();
		publisher = moduleRef.get(SsePublisher);
	});

	afterEach(async () => {
		await moduleRef.close();
	});

	it("sends session-ended only to the matching session and closes it", () => {
		publisher.publishSessionEnded({
			userId: "user-1",
			targetId: "session-a",
		});

		expect(getConnections).toHaveBeenCalledWith("user-1");
		expect(nextA).toHaveBeenCalledOnce();
		const event = nextA.mock.calls[0]?.[0] as SseEvent;
		expect(event).toMatchObject({
			type: "session-ended",
			targetId: "session-a",
		});
		expect(event.id).toBeTypeOf("string");
		expect(event.occurredAt).toBeTypeOf("string");
		expect(event).not.toHaveProperty("scope");
		expect(completeA).toHaveBeenCalledOnce();
		expect(unregister).toHaveBeenCalledWith("user-1", "conn-a");
		expect(nextB).not.toHaveBeenCalled();
		expect(completeB).not.toHaveBeenCalled();
	});

	it("sends notification events to every connection of the user", () => {
		const event: SseEvent = {
			type: "notification-created",
			id: "evt-3",
			occurredAt: "2026-07-21T10:00:00.000Z",
			notification: {
				id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
				event: "budget.member.invited",
				metadata: {
					budgetId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
					budgetName: "Summer house",
				},
				readAt: null,
				createdAt: "2026-07-21T10:00:00.000Z",
			},
		};

		publisher.publish("user-1", event);

		expect(nextA).toHaveBeenCalledWith(event);
		expect(nextB).toHaveBeenCalledWith(event);
		expect(completeA).not.toHaveBeenCalled();
		expect(completeB).not.toHaveBeenCalled();
		expect(unregister).not.toHaveBeenCalled();
	});
});
