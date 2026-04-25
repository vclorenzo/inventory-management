"use client";
import ReactHookForm from "@/components/forms/ReactHookForm";
import Header from "@/components/Header";
import { buildChangePasswordFields } from "@/constants/ChangePasswordForm";
import { useMe } from "@/hooks/useMe";
import { useChangePasswordMutation } from "@/state/internal/authApi";
import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import { ChangePasswordFormValues } from "@/types/pages/User";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const ChangePassword = () => {
  const { me, isLoading: isMeLoading } = useMe();
  const userId = me?.data.userId;
  const [changePassword, { isLoading: isChangeLoading }] =
    useChangePasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { watch, getValues, trigger } = form;
  const newPassword = watch("newPassword");

  useEffect(() => {
    const confirm = getValues("confirmPassword");
    if (!confirm) return;
    void trigger("confirmPassword");
  }, [newPassword, getValues, trigger]);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setFormError(null);
    setFormSuccess(null);
    if (!userId) {
      setFormError(
        "Unable to verify your account. Please refresh and try again.",
      );
      return;
    }
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();
      setFormSuccess("Your password has been updated.");
      form.reset({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setFormError(
        e?.data?.message ?? "Could not update your password. Please try again.",
      );
    }
  };

  const fields: ReusableFieldConfig<ChangePasswordFormValues>[] = useMemo(
    () => buildChangePasswordFields({ getValues }),
    [getValues],
  );

  return (
    <div className="w-full">
      <Header name="Change Password" />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Password Details
              </th>
            </tr>
          </thead>
          <tbody>
            <div className="overflow-x-auto mt-5 shadow-md">
              <div className="p-10 w-[fit-content]">
                {formError ? (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 max-w-md">
                    {formError}
                  </div>
                ) : null}
                {formSuccess ? (
                  <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 max-w-md">
                    {formSuccess}
                  </div>
                ) : null}
                <ReactHookForm
                  form={form}
                  fields={fields}
                  onSubmit={onSubmit}
                  submitLabel="Save"
                  isSubmitting={isChangeLoading || isMeLoading}
                />
              </div>
            </div>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChangePassword;
