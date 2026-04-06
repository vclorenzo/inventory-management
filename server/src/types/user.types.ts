export type CreateSignupInput = {
	name: string;
	email: string;
	password: string;
	role: 'admin' | 'user' | 'guest';
};
export type CreateSigninInput = {
	email: string;
	password: string;
};
