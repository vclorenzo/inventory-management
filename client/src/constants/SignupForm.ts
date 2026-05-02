import type {
  ReusableFieldConfig,
  SelectOption,
} from "@/types/components/ReactHookForm";
import type { SignUpFormValues } from "@/types/pages/User";
import type { UseFormGetValues } from "react-hook-form";
type Args = {
  roleOptions: SelectOption[];
  getValues: UseFormGetValues<SignUpFormValues>;
};

export function buildSignupFormFields({
  roleOptions,
  getValues,
}: Args): ReusableFieldConfig<SignUpFormValues>[] {
  return [
    {
      name: "name",
      label: "Name",
      type: "text",
      autoComplete: "name",
      rules: { required: "Name is required" },
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      rules: {
        required: "Email is required",
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Enter a valid email address",
        },
      },
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      rules: {
        required: "Password is required",
        minLength: {
          value: 6,
          message: "Password must be at least 6 characters",
        },
        maxLength: {
          value: 128,
          message: "Password must be at most 128 characters",
        },
      },
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select Role",
      options: roleOptions,
      rules: {
        required: "Role is required",
        validate: (value: string) => {
          if (!value) return true;
          return value === "user" || value === "admin" || value === "guest"
            ? true
            : "Invalid role";
        },
      },
    },
  ];
}
