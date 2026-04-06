import logger from '#config/logger.ts';
import { AppError } from '#error/AppError.ts';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
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
