import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";

import { AuthService } from "../../auth-service/auth.service.js";
import { SsePublisher } from "../../sse-service/sse-publisher.service.js";
import { TestModule } from "../test.module.js";

export async function createAuthTestingModule(overrides?: {
	ssePublisher?: Partial<SsePublisher>;
}): Promise<TestingModule> {
	return Test.createTestingModule({
		imports: [TestModule],
		providers: [
			AuthService,
			{
				provide: SsePublisher,
				useValue: {
					publishSessionEnded:
						overrides?.ssePublisher?.publishSessionEnded ??
						vi.fn().mockResolvedValue(true),
					publish:
						overrides?.ssePublisher?.publish ?? vi.fn().mockResolvedValue(true),
				},
			},
		],
	}).compile();
}
