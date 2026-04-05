export type CreateUserInput = {
	name: string;
	email: string;
	password: string;
	role: string; // TODO only allow certain roles
};
