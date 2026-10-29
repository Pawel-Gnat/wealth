import { describe, expect, it } from "vitest";
import { createModuleContextStore } from "./context-store";
import { createObservability } from "./create-observability";
import type { DomainLogContext, LogRecord } from "./types";

const domain: DomainLogContext = {
	actorId: "actor-1",
	ownerType: "budget",
	ownerId: "budget-1",
	subjectType: "record",
	subjectId: "record-1",
};

describe("logger domain context", () => {
	it("keeps a name-only event free of domain fields", () => {
		const records: LogRecord[] = [];
		const observability = createObservability(createModuleContextStore());
		observability.init({
			service: "backend",
			environment: "test",
			logSink: { write: (record) => records.push(record) },
		});

		observability.logger.info("sse.frame.error");

		expect(records[0]).toMatchObject({
			event: "sse.frame.error",
			level: "info",
		});
		expect(records[0]).not.toHaveProperty("actorId");
		expect(records[0]).not.toHaveProperty("ownerId");
		expect(records[0]).not.toHaveProperty("subjectId");
	});

	it("writes domain fields next to the request user", () => {
		const records: LogRecord[] = [];
		const store = createModuleContextStore();
		const observability = createObservability(store);
		observability.init({
			service: "backend",
			environment: "test",
			logSink: { write: (record) => records.push(record) },
		});
		store.setUserId("session-user");

		observability.logger.warn("budget.deleted", domain);

		expect(records[0]).toMatchObject({
			event: "budget.deleted",
			level: "warn",
			userId: "session-user",
			...domain,
		});
	});
});
