import type { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import type { ChangePasswordFormValues } from "@/types/User";
import { ChangeEvent } from "react";

type Args = {
  handleChangeOldPassword: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleChangeNewPassword: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleChangeConfirmPassword: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
};

export function buildChangePasswordFields({
  handleChangeOldPassword,
  handleChangeNewPassword,
  handleChangeConfirmPassword,
}: Args): ReusableFieldConfig<ChangePasswordFormValues>[] {
  return [
    {
      name: "oldPassword",
      label: "Old Password",
      type: "text",
      rules: {
        required: "Old Password is required",
        minLength: { value: 2, message: "Name must be at least 2 characters" },
      },
      onChange: handleChangeOldPassword,
    },
    {
      name: "newPassword",
      label: "New Password",
      type: "password",
      rules: {
        required: "New Password is required",
        minLength: { value: 2, message: "Name must be at least 2 characters" },
      },
      onChange: handleChangeNewPassword,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      rules: {
        required: "Confirm Password is required",
        minLength: { value: 2, message: "Name must be at least 2 characters" },
      },
      onChange: handleChangeConfirmPassword,
    },
  ];
}
