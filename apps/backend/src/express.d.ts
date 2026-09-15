export {};

declare global {
	namespace Express {
		interface User {
			userId: string;
			sessionId: string;
			sessionExpiresAt: Date;
		}

		interface Request {
			user?: User;
		}
	}
}
