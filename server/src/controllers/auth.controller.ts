import logger from '#config/logger.ts';
import { createUser } from '#src/services/auth.service.ts';
import { jwtToken } from '#utils/jwt.ts';
import { Request, Response, NextFunction } from 'express';

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// const validationResult = signupSchema.safeParse(req.body);
		// if (!validationResult.success) {
		//   return res.status(400).json({
		//     error: 'Validation failed',
		//     details: formatValidationError(validationResult.error),
		//   });
		// }
		// const { name, email, password, role } = validationResult.data;
		const { name, email, password, role } = req.body;
		const user = await createUser({ name, email, password, role });
		// const token = jwtToken.sign({
		// 	id: user,
		// 	email: user.email,
		// 	role: user.role,
		// });

		// cookies.set(res, 'token', token);
		// logger.info(`User registered successfully: ${email}`);
		return res.status(201).json({
			message: 'User registered',
			user,
		});
	} catch (error: any) {
		logger.error('Signup error', error);
		if (error.message === 'User with this email already exists') {
			return res.status(409).json({ error: 'Email already exists' });
		}
		next(error);
	}
};
