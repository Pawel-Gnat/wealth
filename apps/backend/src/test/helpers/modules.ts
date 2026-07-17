import { JwtModule } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ACCESS_TOKEN_EXPIRES_IN } from "@repo/common/constants";

import { AuthService } from "../../auth-service/auth.service.js";
import { TestModule } from "../test.module.js";

const TEST_JWT_SECRET = "test-only-jwt-secret";

export async function createAuthTestingModule(): Promise<TestingModule> {
	return Test.createTestingModule({
		imports: [
			TestModule,
			JwtModule.register({
				global: true,
				secret: TEST_JWT_SECRET,
				signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
			}),
		],
		providers: [AuthService],
	}).compile();
}
