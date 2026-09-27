import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";

import { AuthService } from "../../auth-service/auth.service";
import { SsePublisher } from "../../sse-service/sse-publisher.service";
import { StorageService } from "../../storage-service/storage.service";
import { TestModule } from "../test.module";

export async function createAuthTestingModule(overrides?: {
	ssePublisher?: Partial<SsePublisher>;
	storageService?: Partial<StorageService>;
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
			{
				provide: StorageService,
				useValue: {
					uploadAvatar:
						overrides?.storageService?.uploadAvatar ??
						vi.fn().mockResolvedValue({ id: "storage-id" }),
					delete:
						overrides?.storageService?.delete ??
						vi.fn().mockResolvedValue(undefined),
					resolvePublicUrl:
						overrides?.storageService?.resolvePublicUrl ??
						vi.fn().mockResolvedValue(null),
				},
			},
		],
	}).compile();
}
