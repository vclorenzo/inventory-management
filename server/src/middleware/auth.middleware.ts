import { Request, Response, NextFunction } from 'express';
import { jwtToken } from '#utils/jwt.js';
import logger from '#config/logger.ts';

interface DecodedToken {
	email: string;
	role: string;
	[key: string]: unknown;
}

export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const token = req.cookies.token;
		if (!token) {
			res.status(401).json({
				error: 'Authentication required',
				message: 'No access token provided',
			});
			return;
		}

		const decoded = jwtToken.verify(token) as DecodedToken;
		req.user = decoded;

		logger.info(`User authenticated ${decoded.email} (${decoded.role})`);
		next();
	} catch (error) {
		logger.error('Authenticator error:', error);
		if (
			error instanceof Error &&
			error.message === 'Failed to authenticate token'
		) {
			res.status(401).json({
				error: 'Authentication failed',
				message: 'Invalid or expired token',
			});
			return;
		}
		res.status(500).json({
			error: 'Internal server error',
			message: 'Error during authentication',
		});
	}
};

export const requireRole = (allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			if (!req.user) {
				res.status(401).json({
					error: 'Authentication required',
					message: 'User not authenticated',
				});
				return;
			}

			if (!allowedRoles.includes(req.user.role)) {
				logger.warn(
					`Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${allowedRoles.join(', ')}`,
				);
				res.status(403).json({
					error: 'Access denied',
					message: 'Insufficient permissions',
				});
				return;
			}
			next();
		} catch (error) {
			logger.error('Role verification error:', error);
			res.status(500).json({
				error: 'Internal server error',
				message: 'Error during role verification',
			});
		}
	};
};
