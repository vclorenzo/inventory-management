"use client";
import ReactHookForm from "@/components/forms/ReactHookForm";
import Header from "@/components/Header";
import { buildChangePasswordFields } from "@/constants/ChangePasswordForm";
import { useMe } from "@/hooks/useMe";
import { useUpdateProfileMutation } from "@/state/internal/profileApi";
import { useUpdateUserMutation } from "@/state/internal/usersApi";
import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import { ChangePasswordFormValues } from "@/types/User";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const ChangePassword = () => {
  const [updateProfile, { isLoading: isUpdateLoading }] =
    useUpdateProfileMutation();
  const [updateUser, { isLoading: isUpdateUserLoading }] =
    useUpdateUserMutation();
  const { me, isLoading: isMeLoading } = useMe();
  const userId = me?.data.userId;

  const form = useForm<ChangePasswordFormValues>();
  const { watch } = form;

  const onSubmit = () => {
    if (!userId) return;
  };

  const handleChangeOldPassword = (e: any) => {
    const value = e.target.value;
    setOldPassword(value);
  };
  const handleChangeNewPassword = (e: any) => {
    const value = e.target.value;
    setNewPassword(value);
  };
  const handleChangeConfirmPassword = (e: any) => {
    const value = e.target.value;
    setConfirmPassword(value);
  };

  const [oldPassword, setOldPassword] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();

  const fields: ReusableFieldConfig<ChangePasswordFormValues>[] =
    useMemo(() => {
      const newPasswordValue = watch("newPassword");

      return buildChangePasswordFields({
        handleChangeOldPassword,
        handleChangeNewPassword,
        handleChangeConfirmPassword,
      });
    }, [watch]);

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
                <ReactHookForm
                  form={form}
                  fields={fields}
                  onSubmit={onSubmit}
                  submitLabel="Save"
                  // isSubmitting={isUpdateLoading}
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
