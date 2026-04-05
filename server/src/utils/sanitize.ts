import { CreateUserInput } from '#types/user.types.ts';
import validator from 'validator';

export const sanitizeUserInput = (input: CreateUserInput) => {
	return {
		name: validator.escape(validator.trim(input.name)),
		email: validator.normalizeEmail(input.email) || '',
		password: input.password,
		role: input.role,
	};
};
