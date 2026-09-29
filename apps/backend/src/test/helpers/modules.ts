import { Global, Module, type Provider } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";

import { AuthService } from "../../auth-service/auth.service";
import { SsePublisher } from "../../sse-service/sse-publisher.service";
import { StorageModule } from "../../storage-service/storage.module";
import { StorageService } from "../../storage-service/storage.service";
import { TestModule } from "../test.module";

const createStorageDouble = (overrides?: Partial<StorageService>) => ({
	uploadAvatar:
		overrides?.uploadAvatar ?? vi.fn().mockResolvedValue({ id: "storage-id" }),
	delete: overrides?.delete ?? vi.fn().mockResolvedValue(undefined),
	resolvePublicUrl:
		overrides?.resolvePublicUrl ?? vi.fn().mockResolvedValue(new Map()),
});

const createTestStorageModule = (storageService: Partial<StorageService>) => {
	@Global()
	@Module({
		providers: [{ provide: StorageService, useValue: storageService }],
		exports: [StorageService],
	})
	class TestStorageModule {}

	return TestStorageModule;
};

export const createTestApp = (providers: Provider[] = []) =>
	Test.createTestingModule({
		imports: [TestModule],
		providers,
	})
		.overrideModule(StorageModule)
		.useModule(createTestStorageModule(createStorageDouble()));

export async function createAuthTestingModule(overrides?: {
	ssePublisher?: Partial<SsePublisher>;
	storageService?: Partial<StorageService>;
}): Promise<TestingModule> {
	const storageService = createStorageDouble(overrides?.storageService);

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
	})
		.overrideModule(StorageModule)
		.useModule(createTestStorageModule(storageService))
		.compile();
}
