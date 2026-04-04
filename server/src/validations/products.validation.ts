import z from "zod";

export const productIdSchema = z.object({
  productId: z.string().uuid(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  price: z.number().positive(),
  rating: z.number().min(0).max(5).optional(),
  stockQuantity: z.number().int().min(0),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1).max(255).trim().optional(),
    price: z.number().positive().optional(),
    rating: z.number().min(0).max(5).optional(),
    stockQuantity: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one field is provided for update
      return Object.keys(data).length > 0;
    },
    {
      message: 'At least one field must be provided for update',
    },
  );
