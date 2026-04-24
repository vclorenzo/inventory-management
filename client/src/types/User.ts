export interface User {
  userId: string;
  name: string;
  email: string;
}

export type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

export type UserFormValues = {
  name: string;
  email: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
};

export type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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
