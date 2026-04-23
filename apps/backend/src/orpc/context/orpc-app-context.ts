import type { AuthService } from "src/auth/auth.service";

export type OrpcAppContext = {
	auth: AuthService;
};
