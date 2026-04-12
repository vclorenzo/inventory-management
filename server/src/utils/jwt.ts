import jwt from 'jsonwebtoken';
import logger from '#config/logger.ts';
import { AppError } from '#error/AppError.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'test';
const JWT_EXPIRES_IN = '1d';

export const jwtToken = {
	sign: (payload: any) => {
		try {
			return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
		} catch (error) {
			logger.error('Error signing token', error);
			throw new AppError('Error signing token');
		}
	},
	verify: (token: string) => {
		try {
			return jwt.verify(token, JWT_SECRET);
		} catch (error) {
			logger.error('Failed to authenticate token', error);
			throw new AppError('Failed to authenticate token');
		}
	},
};
