import 'express';

declare global {
	namespace Express {
		interface Request {
			user?: {
				email: string;
				role: string;
				[key: string]: unknown;
			};
		}
	}
}

export {};
