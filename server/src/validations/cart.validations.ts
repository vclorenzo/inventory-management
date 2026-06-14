import z from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).optional(),
  variation: z.string().max(255).optional(),
  image: z.string().url().optional(),
  badges: z.array(z.string().max(100)).optional(),
  currency: z.string().max(10).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const cartItemIdSchema = z.object({
  id: z.string().uuid(),
});
