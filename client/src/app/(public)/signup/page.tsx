"use client";

import ReactHookForm from "@/components/forms/ReactHookForm";
import { useSignUpMutation } from "@/state/internal/authApi";
import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import { SignUpFormValues } from "@/types/pages/User";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";

export default function SignupPage() {
  const router = useRouter();
  const [signUp, { isLoading: isSignUpLoading }] = useSignUpMutation();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const { watch, getValues, trigger } = form;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signUp({ name, email, password, role }).unwrap();
      router.push("/");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.data?.error ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  const fields: ReusableFieldConfig<SignUpFormValues>[] = useMemo(() => {
    buildChangePasswordFields({ getValues });
  }, [getValues]);

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
          submitLabel="Save"
          isSubmitting={isSignUpLoading}
        />
      </div>
    </div>
  );
}
