export type SignUpRequest = {
	name: string;
	email: string;
	password: string;
	role: string;
};

export type SignInRequest = {
	email: string;
	password: string;
};

export type SignUpResponse = {
	message: string;
	data: {
		userId: string;
		profileId: string;
		name: string;
		email: string;
		role: string;
		created_at: string;
	};
};

export type SignInResponse = {
	message: string;
	data: {
		name: string;
		email: string;
		role: string;
		userId?: string;
	};
};

export type MeResponse = {
	data: {
		userId: string;
		name: string;
		email: string;
		role: string;
		created_at?: string;
	};
};
