"use client";

import { roleOptions } from "@/app/(authenticated)/constants/User";
import ReactHookForm from "@/components/forms/ReactHookForm";
import { buildSignupFormFields } from "@/constants/SignupForm";
import { useSignUpMutation } from "@/state/internal/authApi";
import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import { SignUpFormValues } from "@/types/pages/User";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

export default function SignupPage() {
  const router = useRouter();
  const [signUp, { isLoading: isSignUpLoading }] = useSignUpMutation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const { getValues } = form;

  const onSubmit = async (values: SignUpFormValues) => {
    setError(null);

    try {
      await signUp(values).unwrap();
      router.push("/");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.data?.error ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  const fields: ReusableFieldConfig<SignUpFormValues>[] = useMemo(
    () => buildSignupFormFields({ roleOptions, getValues }),
    [getValues],
  );

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Sign up</h1>
          <p className="text-sm text-gray-500">Register your new account.</p>
        </div>
        <ReactHookForm
          form={form}
          fields={fields}
          onSubmit={onSubmit}
          submitLabel="Register"
          isSubmitting={isSignUpLoading}
          link="/login"
          linkText="Don’t have an account? Sign in"
        />
      </div>
    </div>
  );
}
