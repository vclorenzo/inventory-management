import logger from '#config/logger.ts';
import * as userService from '#services/user.service.ts';
import { authenticateUser, createUser } from '#src/services/auth.service.ts';
import { CreateSigninInput, CreateSignupInput } from '#types/user.types.ts';
import { cookies } from '#utils/cookies.ts';
import { sanitizeSigninInput, sanitizeSignupInput } from '#utils/sanitize.ts';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const sanitized = sanitizeSignupInput(req.body);

		const dto: CreateSignupInput = {
			name: sanitized.name,
			email: sanitized.email,
			password: sanitized.password,
			role: sanitized.role,
		};
		const { newUser, token } = await createUser(dto);

		cookies.set(res, 'token', token);
		logger.info(`User registered successfully: ${newUser.email}`);
		return res.status(201).json({
			message: 'User registered',
			data: newUser,
		});
	} catch (error) {
		next(error);
	}
};

export const signin = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const sanitized = sanitizeSigninInput(req.body);
		const dto: CreateSigninInput = {
			email: sanitized.email,
			password: sanitized.password,
		};

		const { user, token } = await authenticateUser(dto);

		cookies.set(res, 'token', token);
		logger.info(`User signed in successfully: ${user.email}`);
		return res.status(200).json({
			message: 'Signed in successfully',
			data: user,
		});
	} catch (error: any) {
		next(error);
	}
};

export const signout = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		cookies.clear(res, 'token');
		logger.info('User signed out successfully');
		return res.status(200).json({ message: 'Signed out successfully' });
	} catch (error) {
		logger.error('Signout error', error);
		next(error);
	}
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = (req.user as any)?.id as string;

		if (!id) {
			return res.status(401).json({
				error: 'Authentication required',
				message: 'Invalid session',
			});
		}

		const user = await userService.getUserById(id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		return res.status(200).json({ data: user });
	} catch (error) {
		next(error);
	}
};
