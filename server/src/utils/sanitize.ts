import { CreateSigninInput, CreateSignupInput } from '#types/user.types.ts';
import validator from 'validator';

export const sanitizeSignupInput = (input: CreateSignupInput) => {
	return {
		name: validator.escape(validator.trim(input.name)),
		email: validator.normalizeEmail(input.email) || '',
		password: input.password,
		role: input.role,
	};
};

export const sanitizeSigninInput = (input: CreateSigninInput) => {
	return {
		email: validator.normalizeEmail(input.email) || '',
		password: input.password,
	};
};
