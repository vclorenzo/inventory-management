import 'express';

declare global {
	namespace Express {
		interface Request {
			user?: {
				email: string;
				role: string;
				[key: string]: unknown;
			};
			pagination?: {
				page: number;
				limit?: number;
			};
			file?: {
				fieldname: string;
				originalname: string;
				encoding: string;
				mimetype: string;
				size: number;
				buffer: Buffer;
			};
		}
	}
}

export {};
