import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === "" || value === null) return null;
  return value;
};

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    gender: z.preprocess(
      emptyToNull,
      z
        .enum(["male", "female", "other", "prefer_not_to_say"])
        .nullable()
        .optional(),
    ),
    contactNumber: z.preprocess(
      emptyToNull,
      z
        .string()
        .regex(/^09\d{9}$/, "Enter a valid Philippine mobile number")
        .nullable()
        .optional(),
    ),
    birthday: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const nullableString = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

const addressFields = {
  label: z.string().trim().min(1, "Label is required").max(50),
  streetName: z.preprocess(
    emptyToNull,
    z.string().trim().min(3).max(255).nullable().optional(),
  ),
  postalCode: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Enter a valid 4-digit postal code")
      .nullable()
      .optional(),
  ),
  region: nullableString(100),
  province: nullableString(100),
  city: nullableString(100),
  barangay: nullableString(100),
  regionCode: nullableString(20),
  provinceCode: nullableString(20),
  cityCode: nullableString(20),
  barangayCode: nullableString(20),
  isDefault: z.boolean().optional(),
};

export const createAddressSchema = z.object(addressFields);

export const updateAddressSchema = z
  .object({
    label: z.string().trim().min(1).max(50).optional(),
    streetName: z.preprocess(
      emptyToNull,
      z.string().trim().min(3).max(255).nullable().optional(),
    ),
    postalCode: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(/^\d{4}$/, "Enter a valid 4-digit postal code")
        .nullable()
        .optional(),
    ),
    region: nullableString(100),
    province: nullableString(100),
    city: nullableString(100),
    barangay: nullableString(100),
    regionCode: nullableString(20),
    provinceCode: nullableString(20),
    cityCode: nullableString(20),
    barangayCode: nullableString(20),
    isDefault: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update",
  });

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
