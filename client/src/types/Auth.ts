export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
  role: string;
};
export type SignUpResponse = {
  message: string;
  newUser: {
    userId: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
};
export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  message: string;
  user: {
    name: string;
    email: string;
    role: string;
    userId?: string;
  };
};

export type MeResponse = {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    created_at?: string;
  };
};
