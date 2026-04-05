import logger from '#config/logger.ts';
import { authenticateUser, createUser } from '#src/services/auth.service.ts';
import { formatValidationError } from '#src/utils/format.ts';
import {
	signinSchema,
	signupSchema,
} from '#src/validations/auth.validations.ts';
import { CreateUserInput } from '#types/user.types.ts';
import { cookies } from '#utils/cookies.ts';
import { jwtToken } from '#utils/jwt.ts';
import { sanitizeUserInput } from '#utils/sanitize.ts';
import { Request, Response, NextFunction } from 'express';

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// try {
	const sanitized = sanitizeUserInput(req.body);

	const dto: CreateUserInput = {
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
		newUser,
	});
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
