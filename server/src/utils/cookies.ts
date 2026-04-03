import { Request, Response } from 'express';

interface CookieOptions {
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: boolean | 'strict' | 'lax' | 'none';
	maxAge?: number;
}

export const cookies = {
	getOptions: (): CookieOptions => ({
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000,
	}),
	set: (
		res: Response,
		name: string,
		value: string,
		options: Partial<CookieOptions> = {},
	) => {
		res.cookie(name, value, { ...cookies.getOptions(), ...options });
	},
	clear: (
		res: Response,
		name: string,
		options: Partial<CookieOptions> = {},
	) => {
		res.clearCookie(name, { ...cookies.getOptions(), ...options });
	},
	get: (req: Request, name: string): string | undefined => {
		return req.cookies[name];
	},
};
