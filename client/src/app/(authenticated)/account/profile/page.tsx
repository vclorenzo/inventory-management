"use client";
import Header from "@/components/Header";
import ReactHookForm from "@/components/forms/ReactHookForm";
import { useAdressDropdowns } from "@/hooks/useAddressDropdown";
import { useMe } from "@/hooks/useMe";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfileMutation } from "@/state/internal/profileApi";
import { SelectOption } from "@/types/components/ReactHookForm";
import { UserFormValues } from "@/types/pages/User";
import {
  buildProfileAddressFields,
  buildProfileDetailsFields,
} from "@/constants/ProfileForm";
import { CircularProgress } from "@mui/material";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-sm border border-[#ebebeb] bg-white shadow-sm">
    <div className="border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {description ? (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      ) : null}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const Profile = () => {
  const [updateProfile, { isLoading: isUpdateLoading }] =
    useUpdateProfileMutation();
  const { me, isLoading: isMeLoading } = useMe();
  const userId = me?.data.userId;

  const {
    profile,
    isLoading: isProfileLoading,
    error: hasProfileError,
  } = useProfile(userId ?? "");

  const [region, setRegion] = useState<string>();
  const [province, setProvince] = useState<string>();
  const [city, setCity] = useState<string>();

  //=================================================================================
  const handleChangeRegion = useMemo(
    () => (e: any) => {
      const value = e.target.value || undefined;
      setRegion(value);
      setProvince(undefined);
      setCity(undefined);
      setValue?.("province", "");
      setValue?.("city", "");
      setValue?.("barangay", "");
    },
    [],
  );

  const handleChangeProvince = useMemo(
    () => (e: any) => {
      const value = e.target.value || undefined;
      setProvince(value);
      setCity(undefined);
      setValue?.("city", "");
      setValue?.("barangay", "");
    },
    [],
  );

  const handleChangeCity = useMemo(
    () => (e: any) => {
      const value = e.target.value || undefined;
      setCity(value);
      setValue?.("barangay", "");
    },
    [],
  );

  // RHF
  const form = useForm<UserFormValues>();
  const { setValue, reset, watch, handleSubmit } = form;

  useEffect(() => {
    if (!profile) return;
    const r = profile.region ?? "";
    const p = profile.province ?? "";
    const c = profile.city ?? "";
    const b = profile.barangay ?? "";
    setRegion(r || undefined);
    setProvince(p || undefined);
    setCity(c || undefined);
    reset({
      name: profile.name ?? "",
      email: profile.email ?? "",
      gender: (profile.gender as UserFormValues["gender"]) ?? "",
      contactNumber: profile.contactNumber ?? "",
      birthday: profile.birthday
        ? profile.birthday.slice(0, 10)
        : "",
      region: r,
      province: p,
      city: c,
      barangay: b,
    });
  }, [profile, reset]);

  const onSubmit = (data: UserFormValues) => {
    if (!userId) return;
    const { email: _email, ...payload } = data;
    updateProfile({ userId, ...payload });
  };

  const {
    regions,
    provinces,
    cities,
    barangays,
    isLoading: isAddressLoading,
    error: hasAddressError,
  } = useAdressDropdowns({
    regionCode: region,
    provinceCode: province,
    cityCode: city,
  });

  const regionValue = watch("region");
  const provinceValue = watch("province");
  const cityValue = watch("city");

  const regionOptions: SelectOption[] = useMemo(
    () => regions.data?.map((r) => ({ value: r.code, label: r.name })) ?? [],
    [regions.data],
  );

  const provinceOptions: SelectOption[] = useMemo(
    () => provinces.data?.map((p) => ({ value: p.code, label: p.name })) ?? [],
    [provinces.data],
  );

  const cityOptions: SelectOption[] = useMemo(
    () => cities.data?.map((c) => ({ value: c.code, label: c.name })) ?? [],
    [cities.data],
  );

  const barangayOptions: SelectOption[] = useMemo(
    () => barangays.data?.map((b) => ({ value: b.code, label: b.name })) ?? [],
    [barangays.data],
  );

  const detailsFields = useMemo(() => buildProfileDetailsFields(), []);

  const addressFields = useMemo(
    () =>
      buildProfileAddressFields({
        regionOptions,
        provinceOptions,
        cityOptions,
        barangayOptions,
        isRegionSelected: Boolean(region),
        isProvinceSelected: Boolean(province),
        isCitySelected: Boolean(city),
        regionValue,
        provinceValue,
        cityValue,
        handleChangeRegion,
        handleChangeProvince,
        handleChangeCity,
      }),
    [
      barangayOptions,
      city,
      cityOptions,
      cityValue,
      handleChangeCity,
      handleChangeProvince,
      handleChangeRegion,
      province,
      provinceOptions,
      provinceValue,
      region,
      regionOptions,
      regionValue,
    ],
  );

  if (isMeLoading || isProfileLoading || isAddressLoading || isUpdateLoading) {
    return (
      <div className="py-4">
        <CircularProgress />
      </div>
    );
  }

  if (hasProfileError || hasAddressError) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Header name="Profile" />

      <form
        className="flex max-w-2xl flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SectionCard
          title="Private Information"
          description={
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              We do not share this information with other users unless explicit
              permission is given by you.
            </span>
          }
        >
          <ReactHookForm
            form={form}
            fields={detailsFields}
            onSubmit={onSubmit}
            renderAs="div"
            showSubmit={false}
            className="flex flex-col gap-4"
          />
        </SectionCard>

        <SectionCard title="Address">
          <ReactHookForm
            form={form}
            fields={addressFields}
            onSubmit={onSubmit}
            renderAs="div"
            showSubmit={false}
            className="flex flex-col gap-4"
          />
        </SectionCard>

        <button
          type="submit"
          disabled={isUpdateLoading}
          className={`mt-2 h-[50px] w-[150px] rounded px-4 py-2 ${
            isUpdateLoading
              ? "cursor-not-allowed bg-blue-300 text-white"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Profile;
