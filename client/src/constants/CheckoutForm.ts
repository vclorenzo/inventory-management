import type {
  ReusableFieldConfig,
  SelectOption,
} from "@/types/components/ReactHookForm";
import type { CheckoutFormValues } from "@/types/pages/Checkout";
import type { ChangeEvent } from "react";

type Args = {
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

export function buildCheckoutShippingFields({
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
}: Args): ReusableFieldConfig<CheckoutFormValues>[] {
  return [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      autoComplete: "name",
      rules: {
        required: "Full name is required",
        minLength: {
          value: 2,
          message: "Name must be at least 2 characters",
        },
      },
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      autoComplete: "tel",
      placeholder: "09XX XXX XXXX",
      rules: {
        required: "Phone number is required",
        pattern: {
          value: /^09\d{9}$/,
          message: "Enter a valid Philippine mobile number",
        },
      },
    },
    {
      name: "streetAddress",
      label: "Street Address",
      type: "textarea",
      placeholder: "House no., street, subdivision",
      rules: {
        required: "Street address is required",
        minLength: {
          value: 5,
          message: "Please provide a complete street address",
        },
      },
    },
    {
      name: "region",
      label: "Region",
      type: "select",
      placeholder: "Select Region",
      options: regionOptions,
      rules: { required: "Region is required" },
      onChange: handleChangeRegion,
    },
    {
      name: "province",
      label: "Province",
      type: "select",
      placeholder: "Select Province",
      options: provinceOptions,
      disabled: !isRegionSelected,
      rules: {
        validate: (v: string) => {
          if (!regionValue) return true;
          return v ? true : "Province is required";
        },
      },
      onChange: handleChangeProvince,
    },
    {
      name: "city",
      label: "City / Municipality",
      type: "select",
      placeholder: "Select City",
      options: cityOptions,
      disabled: !isProvinceSelected,
      rules: {
        validate: (v: string) => {
          if (!provinceValue) return true;
          return v ? true : "City is required";
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
        validate: (v: string) => {
          if (!cityValue) return true;
          return v ? true : "Barangay is required";
        },
      },
    },
    {
      name: "postalCode",
      label: "Postal Code",
      type: "text",
      placeholder: "Optional",
    },
  ];
}

export const PAYMENT_METHOD_OPTIONS = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
  },
  // {
  //   value: "gcash",
  //   label: "GCash",
  //   description: "Pay via GCash e-wallet",
  // },
  // {
  //   value: "card",
  //   label: "Credit / Debit Card",
  //   description: "Visa, Mastercard, and other major cards",
  // },
  // {
  //   value: "bank",
  //   label: "Bank Transfer",
  //   description: "Direct transfer to our bank account",
  // },
] as const;
