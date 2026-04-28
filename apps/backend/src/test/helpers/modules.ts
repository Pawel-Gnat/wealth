import { JwtModule } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthService } from "../../auth/auth.service.js";
import { TestModule } from "../test.module.js";

const TEST_JWT_SECRET = "test-only-jwt-secret";

export async function createAuthTestingModule(): Promise<TestingModule> {
	return Test.createTestingModule({
		imports: [
			TestModule,
			JwtModule.register({
				global: true,
				secret: TEST_JWT_SECRET,
				signOptions: { expiresIn: "1d" },
			}),
		],
		providers: [AuthService],
	}).compile();
}
