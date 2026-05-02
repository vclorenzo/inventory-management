"use client";

import ReactHookForm from "@/components/forms/ReactHookForm";
import { buildLoginFormFields } from "@/constants/LoginForm";
import { useSignInMutation } from "@/state/internal/authApi";
import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import { LoginFormValues } from "@/types/pages/User";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const [signIn, { isLoading: isSignInLoading }] = useSignInMutation();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { getValues } = form;

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    try {
      await signIn(values).unwrap();
      router.push("/");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.data?.error ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  const fields: ReusableFieldConfig<LoginFormValues>[] = useMemo(
    () => buildLoginFormFields({ getValues }),
    [getValues],
  );

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500">Use your account to continue.</p>
        </div>
        <ReactHookForm
          form={form}
          fields={fields}
          onSubmit={onSubmit}
          submitLabel="Login"
          isSubmitting={isSignInLoading}
          link="/signup"
          linkText="Don’t have an account? Sign up"
        />
      </div>
    </div>
  );
}
