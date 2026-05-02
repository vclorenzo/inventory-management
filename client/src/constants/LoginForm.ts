import type { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import type { LoginFormValues } from "@/types/pages/User";
import type { UseFormGetValues } from "react-hook-form";
type Args = { getValues: UseFormGetValues<LoginFormValues> };

export function buildLoginFormFields({
  getValues,
}: Args): ReusableFieldConfig<LoginFormValues>[] {
  return [
    {
      name: "email",
      label: "Email",
      type: "text",
      autoComplete: "email",
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
      autoComplete: "password",
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
  ];
}
