import logger from '#config/logger.ts';
import { AppError } from '#error/AppError.ts';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			message: err.message,
		});
	}

	logger.error(err);

	res.status(500).json({
		message: 'Internal server error',
	});
};
