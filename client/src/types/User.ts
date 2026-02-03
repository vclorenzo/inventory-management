export interface User {
	userId: string;
	name: string;
	email: string;
}

export type UserSetting = {
	label: string;
	value: string | boolean;
	type: 'text' | 'toggle';
};

export type UserFormValues = {
	username: string;
	email: string;
	country: string;
	region: string;
	city: string;
};

export type ChangePasswordFormValues = {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
};
