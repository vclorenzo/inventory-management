"use client";

import ReactHookForm from "@/components/forms/ReactHookForm";
import {
  ADDRESS_LABEL_PRESETS,
  buildAddressLocationFields,
  EMPTY_ADDRESS_FORM,
} from "@/constants/ProfileForm";
import { useAdressDropdowns } from "@/hooks/useAddressDropdown";
import { SelectOption } from "@/types/components/ReactHookForm";
import {
  Address,
  AddressFormValues,
  AddressRequest,
} from "@/types/pages/Profile";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type AddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AddressRequest) => void | Promise<void>;
  isSubmitting?: boolean;
  initialValues?: Address | null;
};

const findLabel = (options: SelectOption[], code?: string) =>
  options.find((option) => option.value === code)?.label;

const toFormValues = (address?: Address | null): AddressFormValues => {
  if (!address) return EMPTY_ADDRESS_FORM;
  return {
    label: address.label || "Home",
    streetName: address.streetName ?? "",
    postalCode: address.postalCode ?? "",
    region: address.regionCode ?? "",
    province: address.provinceCode ?? "",
    city: address.cityCode ?? "",
    barangay: address.barangayCode ?? "",
    isDefault: address.isDefault,
  };
};

const AddressModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialValues,
}: AddressModalProps) => {
  const [region, setRegion] = useState<string>();
  const [province, setProvince] = useState<string>();
  const [city, setCity] = useState<string>();

  const form = useForm<AddressFormValues>({
    defaultValues: EMPTY_ADDRESS_FORM,
  });
  const { register, reset, setValue, watch, handleSubmit } = form;

  const labelValue = watch("label");
  const regionValue = watch("region");
  const provinceValue = watch("province");
  const cityValue = watch("city");
  const isDefault = watch("isDefault");

  useEffect(() => {
    if (!isOpen) return;
    const values = toFormValues(initialValues);
    reset(values);
    setRegion(values.region || undefined);
    setProvince(values.province || undefined);
    setCity(values.city || undefined);
  }, [isOpen, initialValues, reset]);

  const handleChangeRegion = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      setRegion(value);
      setProvince(undefined);
      setCity(undefined);
      setValue("province", "");
      setValue("city", "");
      setValue("barangay", "");
    },
    [setValue],
  );

  const handleChangeProvince = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      setProvince(value);
      setCity(undefined);
      setValue("city", "");
      setValue("barangay", "");
    },
    [setValue],
  );

  const handleChangeCity = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      setCity(value);
      setValue("barangay", "");
    },
    [setValue],
  );

  const { regions, provinces, cities, barangays } = useAdressDropdowns({
    regionCode: region,
    provinceCode: province,
    cityCode: city,
  });

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

  const locationFields = useMemo(
    () =>
      buildAddressLocationFields({
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

  if (!isOpen) return null;

  const isEditing = Boolean(initialValues);
  const isPresetLabel = ADDRESS_LABEL_PRESETS.includes(
    labelValue as (typeof ADDRESS_LABEL_PRESETS)[number],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Address" : "New Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) =>
            onSubmit({
              label: values.label.trim(),
              streetName: values.streetName.trim(),
              postalCode: values.postalCode.trim() || undefined,
              region: findLabel(regionOptions, values.region),
              province: findLabel(provinceOptions, values.province),
              city: findLabel(cityOptions, values.city),
              barangay: findLabel(barangayOptions, values.barangay),
              regionCode: values.region || undefined,
              provinceCode: values.province || undefined,
              cityCode: values.city || undefined,
              barangayCode: values.barangay || undefined,
              isDefault: values.isDefault,
            }),
          )}
        >
          <input
            type="text"
            placeholder="Postal Code"
            className="w-full rounded border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            {...register("postalCode", {
              pattern: {
                value: /^$|^\d{4}$/,
                message: "Enter a valid 4-digit postal code",
              },
            })}
          />
          {form.formState.errors.postalCode ? (
            <p className="-mt-2 text-sm text-red-600">
              {form.formState.errors.postalCode.message}
            </p>
          ) : null}

          <textarea
            placeholder="Street Name, Building, House No."
            rows={3}
            className="w-full resize-none rounded border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            {...register("streetName", {
              required: "Street name is required",
              minLength: {
                value: 3,
                message: "Please provide a complete street address",
              },
            })}
          />
          {form.formState.errors.streetName ? (
            <p className="-mt-2 text-sm text-red-600">
              {form.formState.errors.streetName.message}
            </p>
          ) : null}

          <ReactHookForm
            form={form}
            fields={locationFields}
            onSubmit={() => undefined}
            renderAs="div"
            showSubmit={false}
            className="flex flex-col gap-3"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Label As:</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {ADDRESS_LABEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue("label", preset)}
                  className={`rounded border px-4 py-1.5 text-sm transition-colors ${
                    labelValue === preset
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter a custom label"
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              {...register("label", {
                required: "Label is required",
                minLength: { value: 1, message: "Label is required" },
              })}
            />
            {!isPresetLabel && labelValue ? (
              <p className="mt-1 text-xs text-gray-500">
                Custom label: {labelValue}
              </p>
            ) : null}
            {form.formState.errors.label ? (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.label.message}
              </p>
            ) : null}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4 accent-orange-600"
              checked={isDefault}
              onChange={(e) => setValue("isDefault", e.target.checked)}
            />
            Set as Default Address
          </label>

          <div className="mt-2 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded px-5 py-2 text-sm font-medium text-white ${
                isSubmitting
                  ? "cursor-not-allowed bg-orange-300"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
