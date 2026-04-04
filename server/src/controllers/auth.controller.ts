import logger from '#config/logger.ts';
import { authenticateUser, createUser } from '#src/services/auth.service.ts';
import { formatValidationError } from '#src/utils/format.ts';
import {
	signinSchema,
	signupSchema,
} from '#src/validations/auth.validations.ts';
import { cookies } from '#utils/cookies.ts';
import { jwtToken } from '#utils/jwt.ts';
import { Request, Response, NextFunction } from 'express';

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validationResult = signupSchema.safeParse(req.body);
		if (!validationResult.success) {
			return res.status(400).json({
				error: 'Validation failed',
				details: formatValidationError(validationResult.error),
			});
		}
		const { name, email, password, role } = validationResult.data;
		const { newUser, token } = await createUser({
			name,
			email,
			password,
			role,
		});

		cookies.set(res, 'token', token);
		logger.info(`User registered successfully: ${email}`);
		return res.status(201).json({
			message: 'User registered',
			newUser,
		});
	} catch (error: any) {
		logger.error('Signup error', error);
		if (error.message === 'User with this email already exists') {
			return res.status(409).json({ error: 'Email already exists' });
		}
		next(error);
	}
};

export const signin = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validationResult = signinSchema.safeParse(req.body);
		if (!validationResult.success) {
			return res.status(400).json({
				error: 'Validation failed',
				details: formatValidationError(validationResult.error),
			});
		}
		const { email, password } = validationResult.data;
		const { user, token } = await authenticateUser({ email, password });

		cookies.set(res, 'token', token);
		logger.info(`User signed in successfully: ${email}`);
		return res.status(200).json({
			message: 'Signed in successfully',
			user,
		});
	} catch (error: any) {
		logger.error('Signin error', error);
		if (error.message === 'Invalid credentials') {
			return res.status(401).json({ error: 'Invalid credentials' });
		}
		next(error);
	}
};

export const signout = async (
	req: Request,
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
