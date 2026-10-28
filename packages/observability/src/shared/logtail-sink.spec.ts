import { describe, expect, it, vi } from "vitest";
import { createLogtailLogSink } from "./logtail-sink";
import type { LogRecord } from "./types";

const record = (overrides: Partial<LogRecord> = {}): LogRecord => ({
	service: "backend",
	environment: "test",
	level: "info",
	event: "budget.created",
	...overrides,
});

describe("logtail sink", () => {
	it("forwards domain fields into the log context", () => {
		const info = vi.fn();
		const sink = createLogtailLogSink(
			class {
				info = info;
				warn = vi.fn();
				error = vi.fn();
			},
			{
				sourceToken: "token",
				ingestingHost: "in.example.com",
				errorsDsn: "https://example.com/1",
			},
		);

		sink.write(
			record({
				actorId: "actor-1",
				ownerType: "budget",
				ownerId: "budget-1",
				subjectType: "budget",
				subjectId: "budget-1",
			}),
		);

		expect(info).toHaveBeenCalledWith(
			"budget.created",
			expect.objectContaining({
				actorId: "actor-1",
				ownerType: "budget",
				ownerId: "budget-1",
				subjectType: "budget",
				subjectId: "budget-1",
			}),
		);
	});

	it("omits domain fields when the event has none", () => {
		const info = vi.fn();
		const sink = createLogtailLogSink(
			class {
				info = info;
				warn = vi.fn();
				error = vi.fn();
			},
			{
				sourceToken: "token",
				ingestingHost: "in.example.com",
				errorsDsn: "https://example.com/1",
			},
		);

		sink.write(record());

		const context = info.mock.calls[0]?.[1] as Record<string, unknown>;
		expect(context).not.toHaveProperty("actorId");
		expect(context).not.toHaveProperty("ownerType");
		expect(context).not.toHaveProperty("subjectType");
	});
});
