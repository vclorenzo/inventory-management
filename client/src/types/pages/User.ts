export interface User {
  userId: string;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
}

export type GetUserByIdResponse = {
  message: string;
  user: User;
};

export type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

export type GenderOption =
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say"
  | "";

export type UserFormValues = {
  name: string;
  email: string;
  gender: GenderOption;
  contactNumber: string;
  birthday: string;
};

export type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
  role: string;
};
export type LoginFormValues = {
  email: string;
  password: string;
};

export type UserResponse = {
  message: string;
  updatedUser: {
    email: string;
    updatedProfile: {
      userId: string;
      name: string;
      email: string;
      password: string;
      role: string;
      created_at: string;
      updated_at: string;
    };
  };
};

export type UserRequest = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};
