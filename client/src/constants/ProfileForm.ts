import type {
  ReusableFieldConfig,
  SelectOption,
} from "@/types/components/ReactHookForm";
import type { AddressFormValues } from "@/types/pages/Profile";
import type { UserFormValues } from "@/types/pages/User";
import type { ChangeEvent } from "react";

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const ADDRESS_LABEL_PRESETS = ["Home", "Work"] as const;

type AddressArgs = {
  regionOptions: SelectOption[];
  provinceOptions: SelectOption[];
  cityOptions: SelectOption[];
  barangayOptions: SelectOption[];
  isRegionSelected: boolean;
  isProvinceSelected: boolean;
  isCitySelected: boolean;
  regionValue: string;
  provinceValue: string;
  cityValue: string;
  handleChangeRegion: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleChangeProvince: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleChangeCity: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
};

export function buildProfileDetailsFields(): ReusableFieldConfig<UserFormValues>[] {
  return [
    {
      name: "name",
      label: "Name",
      type: "text",
      rules: {
        required: "Name is required",
        minLength: { value: 2, message: "Name must be at least 2 characters" },
      },
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      disabled: true,
      rules: {
        required: "Email is required",
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Enter a valid email address",
        },
      },
    },
    {
      name: "contactNumber",
      label: "Contact Number",
      type: "text",
      autoComplete: "tel",
      placeholder: "09XX XXX XXXX",
      rules: {
        pattern: {
          value: /^$|^09\d{9}$/,
          message: "Enter a valid Philippine mobile number",
        },
      },
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      placeholder: "Select Gender",
      options: GENDER_OPTIONS,
    },
    {
      name: "birthday",
      label: "Birthday",
      type: "date",
    },
  ];
}

export function buildAddressLocationFields({
  regionOptions,
  provinceOptions,
  cityOptions,
  barangayOptions,
  isRegionSelected,
  isProvinceSelected,
  isCitySelected,
  regionValue,
  provinceValue,
  cityValue,
  handleChangeRegion,
  handleChangeProvince,
  handleChangeCity,
}: AddressArgs): ReusableFieldConfig<AddressFormValues>[] {
  return [
    {
      name: "region",
      label: "Region",
      type: "select",
      placeholder: "Select Region",
      options: regionOptions,
      onChange: handleChangeRegion,
      rules: { required: "Region is required" },
    },
    {
      name: "province",
      label: "Province",
      type: "select",
      placeholder: "Select Province",
      options: provinceOptions,
      disabled: !isRegionSelected,
      rules: {
        validate: (v) => {
          if (!regionValue) return true;
          return typeof v === "string" && v
            ? true
            : "Province is required when a region is selected";
        },
      },
      onChange: handleChangeProvince,
    },
    {
      name: "city",
      label: "City",
      type: "select",
      placeholder: "Select City",
      options: cityOptions,
      disabled: !isProvinceSelected,
      rules: {
        validate: (v) => {
          if (!provinceValue) return true;
          return typeof v === "string" && v
            ? true
            : "City is required when a province is selected";
        },
      },
      onChange: handleChangeCity,
    },
    {
      name: "barangay",
      label: "Barangay",
      type: "select",
      placeholder: "Select Barangay",
      options: barangayOptions,
      disabled: !isCitySelected,
      rules: {
        validate: (v) => {
          if (!cityValue) return true;
          return typeof v === "string" && v
            ? true
            : "Barangay is required when a city is selected";
        },
      },
    },
  ];
}

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  label: "Home",
  name: "",
  contactNumber: "",
  streetName: "",
  postalCode: "",
  region: "",
  province: "",
  city: "",
  barangay: "",
  isDefault: false,
};
