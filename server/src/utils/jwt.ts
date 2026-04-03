import jwt from 'jsonwebtoken';
import logger from '#config/logger.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'test';
const JWT_EXPIRES_IN = '1d';

export const jwtToken = {
	sign: (payload: string) => {
		try {
			return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
		} catch (error) {
			logger.error('failed to authenticate token', error);
			throw new Error('failed to authenticate token');
		}
	},
	verify: (token: string) => {
		try {
			return jwt.verify(token, JWT_SECRET);
		} catch (error) {
			logger.error('Failed to authenticate token', error);
			throw new Error('Failed to authenticate token');
		}
	},
};
