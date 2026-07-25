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
    birthday: z.preprocess(
      emptyToNull,
      z.coerce.date().nullable().optional(),
    ),
    region: z.preprocess(
      emptyToNull,
      z.string().max(100).nullable().optional(),
    ),
    province: z.preprocess(
      emptyToNull,
      z.string().max(100).nullable().optional(),
    ),
    city: z.preprocess(
      emptyToNull,
      z.string().max(100).nullable().optional(),
    ),
    barangay: z.preprocess(
      emptyToNull,
      z.string().max(100).nullable().optional(),
    ),
  })
  .refine(
    (data) =>
      Object.values(data).some((value) => value !== undefined),
    {
      message: "At least one field must be provided for update",
    },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
