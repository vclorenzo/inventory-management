"use client";

import AddressModal from "@/components/AddressModal";
import AddressLine from "@/components/AddressLine";
import Header from "@/components/Header";
import ReactHookForm from "@/components/forms/ReactHookForm";
import { buildProfileDetailsFields } from "@/constants/ProfileForm";
import { useMe } from "@/hooks/useMe";
import { useProfile } from "@/hooks/useProfile";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
  useUpdateProfileMutation,
} from "@/state/internal/profileApi";
import type { Address, AddressRequest } from "@/types/pages/Profile";
import { UserFormValues } from "@/types/pages/User";
import { CircularProgress } from "@mui/material";
import { Lock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const SectionCard = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-sm border border-[#ebebeb] bg-white shadow-sm">
    <div className="flex items-start justify-between gap-3 border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {description ? (
          <div className="mt-1 text-xs text-gray-500">{description}</div>
        ) : null}
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const Address = () => {
  const [updateProfile, { isLoading: isUpdateLoading }] =
    useUpdateProfileMutation();
  const [createAddress, { isLoading: isCreateAddressLoading }] =
    useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdateAddressLoading }] =
    useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleteAddressLoading }] =
    useDeleteAddressMutation();

  const { me, isLoading: isMeLoading } = useMe();
  const userId = me?.data.userId;

  const {
    profile,
    isLoading: isProfileLoading,
    error: hasProfileError,
  } = useProfile(userId ?? "");

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<UserFormValues>();
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (!profile) return;
    reset({
      name: profile.name ?? "",
      email: profile.email ?? "",
      gender: (profile.gender as UserFormValues["gender"]) ?? "",
      contactNumber: profile.contactNumber ?? "",
      birthday: profile.birthday ? profile.birthday.slice(0, 10) : "",
    });
  }, [profile, reset]);

  const detailsFields = useMemo(() => buildProfileDetailsFields(), []);
  const addresses = profile?.addresses ?? [];
  const isAddressBusy =
    isCreateAddressLoading || isUpdateAddressLoading || isDeleteAddressLoading;

  const onSubmitProfile = (data: UserFormValues) => {
    if (!userId) return;
    const { email: _email, ...payload } = data;
    updateProfile({ userId, ...payload });
  };

  const openCreateAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleAddressSubmit = async (payload: AddressRequest) => {
    if (!userId) return;

    if (editingAddress) {
      await updateAddress({
        userId,
        addressId: editingAddress.addressId,
        ...payload,
      }).unwrap();
    } else {
      await createAddress({ userId, ...payload }).unwrap();
    }

    closeAddressModal();
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!userId) return;
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;
    await deleteAddress({ userId, addressId });
  };

  if (isMeLoading || isProfileLoading || isUpdateLoading) {
    return (
      <div className="py-4">
        <CircularProgress />
      </div>
    );
  }

  if (hasProfileError) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to fetch profile
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Header name="Address" />
      <div className="max-w-2xl">
        <SectionCard
          title="Addresses"
          description="Manage multiple delivery addresses and label them as you wish."
          action={
            <button
              type="button"
              onClick={openCreateAddress}
              className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
            >
              <Plus className="h-3.5 w-3.5" />
              New Address
            </button>
          }
        >
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <MapPin className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No addresses saved yet.</p>
              <button
                type="button"
                onClick={openCreateAddress}
                className="text-sm text-orange-600 hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {addresses.map((address) => (
                <li
                  key={address.addressId}
                  className="flex items-start justify-between gap-3 rounded border border-[#ebebeb] p-3"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {address.label}
                      </span>
                      {address.isDefault ? (
                        <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-700">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <AddressLine address={address} />
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditAddress(address)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={`Edit ${address.label}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address.addressId)}
                      disabled={isAddressBusy}
                      className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label={`Delete ${address.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={closeAddressModal}
        onSubmit={handleAddressSubmit}
        isSubmitting={isAddressBusy}
        initialValues={editingAddress}
      />
    </div>
  );
};

export default Address;
