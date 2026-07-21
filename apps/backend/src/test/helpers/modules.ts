import { JwtModule } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ACCESS_TOKEN_EXPIRES_IN } from "@repo/common/constants";
import { vi } from "vitest";

import { AuthService } from "../../auth-service/auth.service.js";
import { SsePublisher } from "../../sse-service/sse-publisher.service.js";
import { TestModule } from "../test.module.js";

const TEST_JWT_SECRET = "test-only-jwt-secret";

export async function createAuthTestingModule(overrides?: {
	ssePublisher?: Partial<SsePublisher>;
}): Promise<TestingModule> {
	return Test.createTestingModule({
		imports: [
			TestModule,
			JwtModule.register({
				global: true,
				secret: TEST_JWT_SECRET,
				signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
			}),
		],
		providers: [
			AuthService,
			{
				provide: SsePublisher,
				useValue: {
					publishAuthSessionRevoked:
						overrides?.ssePublisher?.publishAuthSessionRevoked ??
						vi.fn().mockResolvedValue(true),
					publish:
						overrides?.ssePublisher?.publish ?? vi.fn().mockResolvedValue(true),
				},
			},
		],
	}).compile();
}
